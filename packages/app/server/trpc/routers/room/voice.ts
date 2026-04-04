import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { voiceSignalPayloadSchema } from "#shared/models/room/voice/VoiceSignalPayload";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { voiceEventEmitter } from "@@/server/services/message/events/voiceEventEmitter";
import { addVoiceParticipant } from "@@/server/services/message/voice/addVoiceParticipant";
import { getRoomParticipants } from "@@/server/services/message/voice/getRoomParticipants";
import { deleteVoiceParticipant } from "@@/server/services/message/voice/deleteVoiceParticipant";
import { updateVoiceParticipantMute } from "@@/server/services/message/voice/updateVoiceParticipantMute";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { selectRoomSchema } from "@esposter/db-schema";
import { z } from "zod";

const roomIdInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
const setMuteInputSchema = z.object({ isMuted: z.boolean(), roomId: selectRoomSchema.shape.id });
const sendSignalInputSchema = z.object({ payload: voiceSignalPayloadSchema, roomId: selectRoomSchema.shape.id });
const onVoiceInputSchema = selectRoomSchema.shape.id;

export const voiceRouter = router({
  joinVoiceChannel: getMemberProcedure(roomIdInputSchema, "roomId").mutation<VoiceParticipant[]>(
    ({ ctx, input: { roomId } }) => {
      const { user } = ctx.getSessionPayload;
      const participant: VoiceParticipant = {
        id: user.id,
        image: user.image ?? null,
        isMuted: false,
        name: user.name,
      };
      addVoiceParticipant(roomId, participant);
      voiceEventEmitter.emit("joinVoiceChannel", { participant, roomId, sessionId: ctx.getSessionPayload.session.id });
      return getRoomParticipants(roomId);
    },
  ),

  leaveVoiceChannel: getMemberProcedure(roomIdInputSchema, "roomId").mutation(({ ctx, input: { roomId } }) => {
    const userId = ctx.getSessionPayload.user.id;
    deleteVoiceParticipant(roomId, userId);
    voiceEventEmitter.emit("leaveVoiceChannel", { id: userId, roomId, sessionId: ctx.getSessionPayload.session.id });
  }),

  onMuteChanged: standardAuthedProcedure.input(onVoiceInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ id, isMuted, roomId }] of on(voiceEventEmitter, "muteChanged", { signal })) {
      if (roomId !== input) continue;
      yield { id, isMuted };
    }
  }),

  onParticipantJoin: standardAuthedProcedure.input(onVoiceInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ participant, roomId, sessionId }] of on(voiceEventEmitter, "joinVoiceChannel", { signal })) {
      if (roomId !== input || getIsSameDevice({ sessionId, userId: participant.id }, ctx.getSessionPayload)) continue;
      yield participant;
    }
  }),

  onParticipantLeave: standardAuthedProcedure.input(onVoiceInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ id, roomId, sessionId }] of on(voiceEventEmitter, "leaveVoiceChannel", { signal })) {
      if (roomId !== input || getIsSameDevice({ sessionId, userId: id }, ctx.getSessionPayload)) continue;
      yield id;
    }
  }),

  onSignal: standardAuthedProcedure.input(onVoiceInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ payload, roomId, senderId }] of on(voiceEventEmitter, "signal", { signal })) {
      if (roomId !== input || payload.targetUserId !== ctx.getSessionPayload.user.id) continue;
      yield { payload, senderId };
    }
  }),

  readVoiceParticipants: getMemberProcedure(roomIdInputSchema, "roomId").query<VoiceParticipant[]>(
    ({ input: { roomId } }) => getRoomParticipants(roomId),
  ),

  sendSignal: getMemberProcedure(sendSignalInputSchema, "roomId").mutation(({ ctx, input: { payload, roomId } }) => {
    voiceEventEmitter.emit("signal", { payload, roomId, senderId: ctx.getSessionPayload.user.id });
  }),

  setMute: getMemberProcedure(setMuteInputSchema, "roomId").mutation(({ ctx, input: { isMuted, roomId } }) => {
    const userId = ctx.getSessionPayload.user.id;
    updateVoiceParticipantMute(roomId, userId, isMuted);
    voiceEventEmitter.emit("muteChanged", { id: userId, isMuted, roomId });
  }),
});
