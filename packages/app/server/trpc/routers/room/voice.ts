import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { voiceSignalPayloadSchema } from "#shared/models/room/voice/VoiceSignalPayload";
import { roomIdSchema } from "#shared/models/shared/RoomId";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { on } from "@@/server/services/events/on";
import { messageEventEmitter } from "@@/server/services/message/events/messageEventEmitter";
import { voiceEventEmitter } from "@@/server/services/message/events/voiceEventEmitter";
import { createVoiceParticipant } from "@@/server/services/message/voice/createVoiceParticipant";
import { deleteVoiceParticipant } from "@@/server/services/message/voice/deleteVoiceParticipant";
import { getRoomParticipants } from "@@/server/services/message/voice/getRoomParticipants";
import { updateVoiceParticipantMute } from "@@/server/services/message/voice/updateVoiceParticipantMute";
import { voiceCallStartTimeMap } from "@@/server/services/message/voice/voiceCallStartTimeMap";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { createMessage } from "@esposter/db";
import { AzureTable, MessageType, selectRoomSchema } from "@esposter/db-schema";
import { ForbiddenError, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const roomIdInputSchema = roomIdSchema;
const setMuteInputSchema = z.object({ ...roomIdSchema.shape, isMuted: z.boolean() });
const sendSignalInputSchema = z.object({ ...roomIdSchema.shape, payload: voiceSignalPayloadSchema });
const onJoinVoiceChannelInputSchema = selectRoomSchema.shape.id;
const onLeaveVoiceChannelInputSchema = selectRoomSchema.shape.id;
const onSetMuteInputSchema = selectRoomSchema.shape.id;
const onSendSignalInputSchema = selectRoomSchema.shape.id;

export const voiceRouter = router({
  joinVoiceChannel: getMemberProcedure(roomIdInputSchema, "roomId").mutation<VoiceParticipant[]>(
    async ({ ctx, input: { roomId } }) => {
      const { session, user } = ctx.getSessionPayload;
      const participant: VoiceParticipant = {
        id: session.id,
        image: user.image ?? null,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };
      const isFirstJoiner = getRoomParticipants(roomId).length === 0;
      createVoiceParticipant(roomId, participant);
      voiceEventEmitter.emit("joinVoiceChannel", { participant, roomId, sessionId: session.id });

      if (isFirstJoiner) {
        voiceCallStartTimeMap.set(roomId, new Date());
        try {
          const messageClient = await useTableClient(AzureTable.Messages);
          const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
          const systemMessage = await createMessage(messageClient, messageAscendingClient, {
            roomId,
            type: MessageType.VoiceCall,
            userId: user.id,
          });
          messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId: session.id }]);
        } catch {
          // System message creation is best-effort — voice membership is already committed
        }
      }

      return getRoomParticipants(roomId);
    },
  ),
  leaveVoiceChannel: getMemberProcedure(roomIdInputSchema, "roomId").mutation(async ({ ctx, input: { roomId } }) => {
    const { session, user } = ctx.getSessionPayload;
    const sessionId = session.id;
    const wasDeleted = deleteVoiceParticipant(roomId, sessionId);
    if (wasDeleted) voiceEventEmitter.emit("leaveVoiceChannel", { id: sessionId, roomId, sessionId });

    if (wasDeleted && getRoomParticipants(roomId).length === 0) {
      const callStart = voiceCallStartTimeMap.get(roomId);
      voiceCallStartTimeMap.delete(roomId);
      const durationSeconds = callStart ? Math.round((Date.now() - callStart.getTime()) / 1000) : 0;
      try {
        const messageClient = await useTableClient(AzureTable.Messages);
        const messageAscendingClient = await useTableClient(AzureTable.MessagesAscending);
        // Non-empty message field signals "call ended" — value is duration in seconds
        const systemMessage = await createMessage(messageClient, messageAscendingClient, {
          message: String(durationSeconds),
          roomId,
          type: MessageType.VoiceCall,
          userId: user.id,
        });
        messageEventEmitter.emit("createMessage", [[systemMessage], { isSendToSelf: true, sessionId }]);
      } catch {
        // System message creation is best-effort — voice membership is already committed
      }
    }
  }),
  onJoinVoiceChannel: standardAuthedProcedure.input(onJoinVoiceChannelInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ participant, roomId, sessionId }] of on(voiceEventEmitter, "joinVoiceChannel", { signal })) {
      if (roomId !== input || sessionId === ctx.getSessionPayload.session.id) continue;
      yield participant;
    }
  }),
  onLeaveVoiceChannel: standardAuthedProcedure.input(onLeaveVoiceChannelInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ id, roomId }] of on(voiceEventEmitter, "leaveVoiceChannel", { signal })) {
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

    for await (const [{ payload, roomId, senderId }] of on(voiceEventEmitter, "signal", { signal })) {
      if (roomId !== input || payload.targetId !== ctx.getSessionPayload.session.id) continue;
      yield { payload, senderId };
    }
  }),
  onSetMute: standardAuthedProcedure.input(onSetMuteInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ id, isMuted, roomId }] of on(voiceEventEmitter, "muteChanged", { signal })) {
      if (roomId !== input) continue;
      yield { id, isMuted };
    }
  }),
  readVoiceParticipants: getMemberProcedure(roomIdInputSchema, "roomId").query<VoiceParticipant[]>(
    ({ input: { roomId } }) => getRoomParticipants(roomId),
  ),
  sendSignal: getMemberProcedure(sendSignalInputSchema, "roomId").mutation(({ ctx, input: { payload, roomId } }) => {
    const sessionId = ctx.getSessionPayload.session.id;
    const participants = getRoomParticipants(roomId);
    if (!participants.some((p) => p.id === sessionId))
      throw new TRPCError({
        code: "FORBIDDEN",
        message: new ForbiddenError("Must join voice channel first").message,
      });

    if (!participants.some((p) => p.id === payload.targetId))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError("Target participant", payload.targetId).message,
      });

    voiceEventEmitter.emit("signal", { payload, roomId, senderId: sessionId });
  }),
  setMute: getMemberProcedure(setMuteInputSchema, "roomId").mutation(({ ctx, input: { isMuted, roomId } }) => {
    const sessionId = ctx.getSessionPayload.session.id;
    if (!updateVoiceParticipantMute(roomId, sessionId, isMuted))
      throw new TRPCError({
        code: "FORBIDDEN",
        message: new ForbiddenError("Must join voice channel first").message,
      });

    voiceEventEmitter.emit("muteChanged", { id: sessionId, isMuted, roomId });
  }),
});
