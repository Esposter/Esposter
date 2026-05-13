import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callSignalPayloadSchema } from "#shared/models/room/call/CallSignalPayload";
import { createToken } from "#shared/util/math/random/createToken";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { on } from "@@/server/services/events/on";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { deleteCallParticipant } from "@@/server/services/message/call/deleteCallParticipant";
import { getCallParticipants } from "@@/server/services/message/call/getCallParticipants";
import { joinCallAsParticipant } from "@@/server/services/message/call/joinCallAsParticipant";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { requireCallSession } from "@@/server/services/message/call/requireCallSession";
import { updateCallParticipantMute } from "@@/server/services/message/call/updateCallParticipantMute";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { createMessage } from "@esposter/db";
import {
  AzureTable,
  CALL_TOKEN_LENGTH,
  callSessionIdSchema,
  callSessionsInMessage,
  DatabaseEntityType,
  MessageType,
  roomIdSchema,
  selectCallSessionInMessageSchema,
} from "@esposter/db-schema";
import { ForbiddenError, getResultAsync, InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const joinCallByRoomIdInputSchema = roomIdSchema;
const joinCallInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
const leaveCallInputSchema = callSessionIdSchema;
const setMuteInputSchema = z.object({ ...callSessionIdSchema.shape, isMuted: z.boolean() });
const sendSignalInputSchema = z.object({ ...callSessionIdSchema.shape, payload: callSignalPayloadSchema });
const readCallSessionIdInputSchema = roomIdSchema;
const readCallParticipantsInputSchema = callSessionIdSchema;
const onJoinCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onLeaveCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onSetMuteInputSchema = selectCallSessionInMessageSchema.shape.id;
const onSendSignalInputSchema = selectCallSessionInMessageSchema.shape.id;

export const callRouter = router({
  joinCall: standardAuthedProcedure
    .input(joinCallInputSchema)
    .mutation<{ callSessionId: string; participants: CallParticipant[] }>(async ({ ctx, input: { id } }) => {
      const callSession = await ctx.db.query.callSessionsInMessage.findFirst({
        where: { id: { eq: id } },
      });
      if (!callSession)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.CallSession, id).message,
        });

      const { session, user } = ctx.getSessionPayload;
      const participant: CallParticipant = {
        id: session.id,
        image: user.image ?? null,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };
      return joinCallAsParticipant(callSession, participant, session.id, user.id);
    }),
  joinCallByRoomId: getMemberProcedure(joinCallByRoomIdInputSchema, "roomId").mutation<{
    callSessionId: string;
    participants: CallParticipant[];
  }>(async ({ ctx, input: { roomId } }) => {
    const { session, user } = ctx.getSessionPayload;

    const existingId = await readCallSessionId(ctx.db, roomId);
    let callSessionId: string;

    if (existingId) callSessionId = existingId;
    else {
      let createdId: string | undefined;
      for (let i = 0; i < 3; i++) {
        const id = createToken(CALL_TOKEN_LENGTH);
        const insertResult = await getResultAsync(() =>
          ctx.db.insert(callSessionsInMessage).values({ id, roomId }).returning(),
        );
        const result = insertResult.orTee(console.error).unwrapOr(null);
        if (result?.[0]) {
          createdId = result[0].id;
          break;
        }
      }
      if (!createdId) {
        const fallback = await ctx.db.query.callSessionsInMessage.findFirst({ where: { roomId: { eq: roomId } } });
        if (!fallback)
          throw new TRPCError({
            code: "UNPROCESSABLE_CONTENT",
            message: new InvalidOperationError(Operation.Create, DatabaseEntityType.CallSession, roomId).message,
          });
        createdId = fallback.id;
      }
      callSessionId = createdId;
    }

    const callSession = { id: callSessionId, roomId };
    const participant: CallParticipant = {
      id: session.id,
      image: user.image ?? null,
      isMuted: false,
      name: user.name,
      userId: user.id,
    };
    return joinCallAsParticipant(callSession, participant, session.id, user.id);
  }),
  leaveCall: standardAuthedProcedure.input(leaveCallInputSchema).mutation(async ({ ctx, input: { callSessionId } }) => {
    const { session, user } = ctx.getSessionPayload;
    const sessionId = session.id;
    const wasDeleted = deleteCallParticipant(callSessionId, sessionId);
    if (!wasDeleted)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.CallSession, sessionId).message,
      });
    callEventEmitter.emit("leaveCall", { callSessionId, id: sessionId, sessionId });

    if (getCallParticipants(callSessionId).length === 0) {
      const callSession = await ctx.db.query.callSessionsInMessage.findFirst({
        columns: { roomId: true },
        where: { id: { eq: callSessionId } },
      });
      const callStart = callStartTimeMap.get(callSessionId);
      callStartTimeMap.delete(callSessionId);
      const callDurationSeconds = callStart ? Math.round((Date.now() - callStart.getTime()) / 1000) : 0;
      if (callSession?.roomId) {
        const { roomId } = callSession;
        await getResultAsync(async () => {
          const [messageClient, messageAscendingClient] = await Promise.all([
            useTableClient(AzureTable.Messages),
            useTableClient(AzureTable.MessagesAscending),
          ]);
          const systemMessage = await createMessage(messageClient, messageAscendingClient, {
            message: String(callDurationSeconds),
            roomId,
            type: MessageType.Call,
            userId: user.id,
          });
          messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
        })
          .orTee(console.error)
          .unwrapOr(undefined);
      }
    }
  }),
  onJoinCall: standardAuthedProcedure.input(onJoinCallInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "joinCall", { signal });
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, participant, sessionId }] of events) {
      if (callSessionId !== input || sessionId === ctx.getSessionPayload.session.id) continue;
      yield participant;
    }
  }),
  onLeaveCall: standardAuthedProcedure.input(onLeaveCallInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "leaveCall", { signal });
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, id }] of events) {
      if (callSessionId !== input || id === ctx.getSessionPayload.session.id) continue;
      yield id;
    }
  }),
  onSendSignal: standardAuthedProcedure.input(onSendSignalInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "signal", { signal });
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, payload, senderId }] of events) {
      if (callSessionId !== input || payload.targetId !== ctx.getSessionPayload.session.id) continue;
      yield { payload, senderId };
    }
  }),
  onSetMute: standardAuthedProcedure.input(onSetMuteInputSchema).subscription(async function* ({ ctx, input, signal }) {
    const events = on(callEventEmitter, "muteChanged", { signal });
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, id, isMuted }] of events) {
      if (callSessionId !== input) continue;
      yield { id, isMuted };
    }
  }),
  readCallParticipants: standardAuthedProcedure
    .input(readCallParticipantsInputSchema)
    .query<CallParticipant[]>(async ({ ctx, input: { callSessionId } }) => {
      await requireCallSession(ctx.db, callSessionId);
      return getCallParticipants(callSessionId);
    }),
  readCallSessionId: getMemberProcedure(readCallSessionIdInputSchema, "roomId").query<string>(
    ({ ctx, input: { roomId } }) => readCallSessionId(ctx.db, roomId),
  ),
  sendSignal: standardAuthedProcedure
    .input(sendSignalInputSchema)
    .mutation(({ ctx, input: { callSessionId, payload } }) => {
      const sessionId = ctx.getSessionPayload.session.id;
      const participants = getCallParticipants(callSessionId);
      if (!participants.some((p) => p.id === sessionId))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must join call first").message,
        });

      if (!participants.some((p) => p.id === payload.targetId))
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError("Target participant", payload.targetId).message,
        });

      callEventEmitter.emit("signal", { callSessionId, payload, senderId: sessionId });
    }),
  setMute: standardAuthedProcedure.input(setMuteInputSchema).mutation(({ ctx, input: { callSessionId, isMuted } }) => {
    const sessionId = ctx.getSessionPayload.session.id;
    if (!updateCallParticipantMute(callSessionId, sessionId, isMuted))
      throw new TRPCError({
        code: "FORBIDDEN",
        message: new ForbiddenError("Must join call first").message,
      });

    callEventEmitter.emit("muteChanged", { callSessionId, id: sessionId, isMuted });
  }),
});
