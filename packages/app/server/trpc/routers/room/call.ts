import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { callSignalPayloadSchema } from "#shared/models/room/call/CallSignalPayload";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { on } from "@@/server/services/events/on";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { callStartTimeMap } from "@@/server/services/message/call/callStartTimeMap";
import { createCallParticipant } from "@@/server/services/message/call/createCallParticipant";
import { deleteCallParticipant } from "@@/server/services/message/call/deleteCallParticipant";
import { getCallParticipants } from "@@/server/services/message/call/getCallParticipants";
import { updateCallParticipantMute } from "@@/server/services/message/call/updateCallParticipantMute";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { createMessage } from "@esposter/db";
import { AzureTable, MessageType, roomIdSchema, selectRoomInMessageSchema } from "@esposter/db-schema";
import { ForbiddenError, getResultAsync, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const roomIdInputSchema = roomIdSchema;
const setMuteInputSchema = z.object({ ...roomIdSchema.shape, isMuted: z.boolean() });
const sendSignalInputSchema = z.object({ ...roomIdSchema.shape, payload: callSignalPayloadSchema });
const onJoinCallInputSchema = selectRoomInMessageSchema.shape.id;
const onLeaveCallInputSchema = selectRoomInMessageSchema.shape.id;
const onSetMuteInputSchema = selectRoomInMessageSchema.shape.id;
const onSendSignalInputSchema = selectRoomInMessageSchema.shape.id;

export const callRouter = router({
  joinCall: getMemberProcedure(roomIdInputSchema, "roomId").mutation<CallParticipant[]>(
    async ({ ctx, input: { roomId } }) => {
      const { session, user } = ctx.getSessionPayload;
      const participant: CallParticipant = {
        id: session.id,
        image: user.image ?? null,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };
      const isFirstJoiner = getCallParticipants(roomId).length === 0;
      createCallParticipant(roomId, participant);
      callEventEmitter.emit("joinCall", { participant, roomId, sessionId: session.id });

      if (isFirstJoiner) {
        callStartTimeMap.set(roomId, new Date());
        await getResultAsync(() =>
          Promise.all([useTableClient(AzureTable.Messages), useTableClient(AzureTable.MessagesAscending)]),
        )
          .andThen(([messageClient, messageAscendingClient]) =>
            getResultAsync(() =>
              createMessage(messageClient, messageAscendingClient, {
                roomId,
                type: MessageType.Call,
                userId: user.id,
              }),
            ),
          )
          .andTee((systemMessage) => {
            messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId: session.id }]);
          })
          .orTee(console.error)
          .unwrapOr(undefined);
      }

      return getCallParticipants(roomId);
    },
  ),
  leaveCall: getMemberProcedure(roomIdInputSchema, "roomId").mutation(async ({ ctx, input: { roomId } }) => {
    const { session, user } = ctx.getSessionPayload;
    const sessionId = session.id;
    const wasDeleted = deleteCallParticipant(roomId, sessionId);
    if (wasDeleted) callEventEmitter.emit("leaveCall", { id: sessionId, roomId, sessionId });

    if (wasDeleted && getCallParticipants(roomId).length === 0) {
      const callStart = callStartTimeMap.get(roomId);
      callStartTimeMap.delete(roomId);
      const callDurationSeconds = callStart ? Math.round((Date.now() - callStart.getTime()) / 1000) : 0;
      await getResultAsync(() =>
        Promise.all([useTableClient(AzureTable.Messages), useTableClient(AzureTable.MessagesAscending)]),
      )
        .andThen(([messageClient, messageAscendingClient]) =>
          getResultAsync(() =>
            createMessage(messageClient, messageAscendingClient, {
              message: String(callDurationSeconds),
              roomId,
              type: MessageType.Call,
              userId: user.id,
            }),
          ),
        )
        .andTee((systemMessage) => {
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
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ participant, roomId, sessionId }] of on(callEventEmitter, "joinCall", { signal })) {
      if (roomId !== input || sessionId === ctx.getSessionPayload.session.id) continue;
      yield participant;
    }
  }),
  onLeaveCall: standardAuthedProcedure.input(onLeaveCallInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ id, roomId }] of on(callEventEmitter, "leaveCall", { signal })) {
      if (roomId !== input || id === ctx.getSessionPayload.session.id) continue;
      yield id;
    }
  }),
  onSendSignal: standardAuthedProcedure.input(onSendSignalInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ payload, roomId, senderId }] of on(callEventEmitter, "signal", { signal })) {
      if (roomId !== input || payload.targetId !== ctx.getSessionPayload.session.id) continue;
      yield { payload, senderId };
    }
  }),
  onSetMute: standardAuthedProcedure.input(onSetMuteInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ id, isMuted, roomId }] of on(callEventEmitter, "muteChanged", { signal })) {
      if (roomId !== input) continue;
      yield { id, isMuted };
    }
  }),
  readCallParticipants: getMemberProcedure(roomIdInputSchema, "roomId").query<CallParticipant[]>(
    ({ input: { roomId } }) => getCallParticipants(roomId),
  ),
  sendSignal: getMemberProcedure(sendSignalInputSchema, "roomId").mutation(({ ctx, input: { payload, roomId } }) => {
    const sessionId = ctx.getSessionPayload.session.id;
    const participants = getCallParticipants(roomId);
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

    callEventEmitter.emit("signal", { payload, roomId, senderId: sessionId });
  }),
  setMute: getMemberProcedure(setMuteInputSchema, "roomId").mutation(({ ctx, input: { isMuted, roomId } }) => {
    const sessionId = ctx.getSessionPayload.session.id;
    if (!updateCallParticipantMute(roomId, sessionId, isMuted))
      throw new TRPCError({
        code: "FORBIDDEN",
        message: new ForbiddenError("Must join call first").message,
      });

    callEventEmitter.emit("muteChanged", { id: sessionId, isMuted, roomId });
  }),
});
