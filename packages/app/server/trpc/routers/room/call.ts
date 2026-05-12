import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { CallSessionInMessage } from "@esposter/db-schema";

import { callSignalPayloadSchema } from "#shared/models/room/call/CallSignalPayload";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { on } from "@@/server/services/events/on";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { deleteCallParticipant } from "@@/server/services/message/call/deleteCallParticipant";
import { getCallParticipants } from "@@/server/services/message/call/getCallParticipants";
import { getOrCreateCallSession } from "@@/server/services/message/call/getOrCreateCallSession";
import { joinCallAsParticipant } from "@@/server/services/message/call/joinCallAsParticipant";
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
  callSessionIdSchema,
  DatabaseEntityType,
  MessageType,
  roomIdSchema,
  selectCallSessionInMessageSchema,
} from "@esposter/db-schema";
import { ForbiddenError, getResultAsync, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const joinCallInputSchema = roomIdSchema;
const joinCallByTokenInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
const leaveCallInputSchema = callSessionIdSchema;
const setMuteInputSchema = z.object({ ...callSessionIdSchema.shape, isMuted: z.boolean() });
const sendSignalInputSchema = z.object({ ...callSessionIdSchema.shape, payload: callSignalPayloadSchema });
const readCallSessionInputSchema = roomIdSchema;
const readCallParticipantsInputSchema = callSessionIdSchema;
const onJoinCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onLeaveCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onSetMuteInputSchema = selectCallSessionInMessageSchema.shape.id;
const onSendSignalInputSchema = selectCallSessionInMessageSchema.shape.id;

export const callRouter = router({
  joinCall: getMemberProcedure(joinCallInputSchema, "roomId").mutation<{
    callSessionId: string;
    participants: CallParticipant[];
  }>(async ({ ctx, input: { roomId } }) => {
    const { session, user } = ctx.getSessionPayload;
    const callSession = await getOrCreateCallSession(ctx.db, roomId);
    const participant: CallParticipant = {
      id: session.id,
      image: user.image ?? null,
      isMuted: false,
      name: user.name,
      userId: user.id,
    };
    return joinCallAsParticipant(callSession, participant, session.id, user.id);
  }),
  joinCallByToken: standardAuthedProcedure
    .input(joinCallByTokenInputSchema)
    .mutation<{ callSessionId: string; participants: CallParticipant[] }>(async ({ ctx, input: { id } }) => {
      const callSession = await ctx.db.query.callSessionsInMessage.findFirst({
        where: { id: { eq: id } },
      });
      if (!callSession)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.CallSession, token).message,
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
  leaveCall: standardAuthedProcedure.input(leaveCallInputSchema).mutation(async ({ ctx, input: { callSessionId } }) => {
    const { session, user } = ctx.getSessionPayload;
    const sessionId = session.id;
    const wasDeleted = deleteCallParticipant(callSessionId, sessionId);
    if (wasDeleted) callEventEmitter.emit("leaveCall", { callSessionId, id: sessionId, sessionId });

    if (wasDeleted && getCallParticipants(callSessionId).length === 0) {
      const callSession = await ctx.db.query.callSessionsInMessage.findFirst({
        columns: { roomId: true },
        where: { id: { eq: callSessionId } },
      });
      const callStart = callStartTimeMap.get(callSessionId);
      callStartTimeMap.delete(callSessionId);
      const callDurationSeconds = callStart ? Math.round((Date.now() - callStart.getTime()) / 1000) : 0;
      if (callSession?.roomId)
        await getResultAsync(async () => {
          const [messageClient, messageAscendingClient] = await Promise.all([
            useTableClient(AzureTable.Messages),
            useTableClient(AzureTable.MessagesAscending),
          ]);
          const systemMessage = await createMessage(messageClient, messageAscendingClient, {
            message: String(callDurationSeconds),
            roomId: callSession.roomId,
            type: MessageType.Call,
            userId: user.id,
          });
          messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
        })
          .orTee(console.error)
          .unwrapOr(undefined);
    }
  }),
  onJoinCall: standardAuthedProcedure.input(onJoinCallInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, participant, sessionId }] of on(callEventEmitter, "joinCall", { signal })) {
      if (callSessionId !== input || sessionId === ctx.getSessionPayload.session.id) continue;
      yield participant;
    }
  }),
  onLeaveCall: standardAuthedProcedure.input(onLeaveCallInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, id }] of on(callEventEmitter, "leaveCall", { signal })) {
      if (callSessionId !== input || id === ctx.getSessionPayload.session.id) continue;
      yield id;
    }
  }),
  onSendSignal: standardAuthedProcedure.input(onSendSignalInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, payload, senderId }] of on(callEventEmitter, "signal", { signal })) {
      if (callSessionId !== input || payload.targetId !== ctx.getSessionPayload.session.id) continue;
      yield { payload, senderId };
    }
  }),
  onSetMute: standardAuthedProcedure.input(onSetMuteInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, id, isMuted }] of on(callEventEmitter, "muteChanged", { signal })) {
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
  readCallSession: getMemberProcedure(readCallSessionInputSchema, "roomId").query<CallSessionInMessage>(
    ({ ctx, input: { roomId } }) => getOrCreateCallSession(ctx.db, roomId),
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
