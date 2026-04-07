import type { VoiceParticipant } from "#shared/models/room/voice/VoiceParticipant";

import { voiceSignalPayloadSchema } from "#shared/models/room/voice/VoiceSignalPayload";
import { on } from "@@/server/services/events/on";
import { voiceEventEmitter } from "@@/server/services/message/events/voiceEventEmitter";
import { createVoiceParticipant } from "@@/server/services/message/voice/createVoiceParticipant";
import { deleteVoiceParticipant } from "@@/server/services/message/voice/deleteVoiceParticipant";
import { getRoomParticipants } from "@@/server/services/message/voice/getRoomParticipants";
import { updateVoiceParticipantMute } from "@@/server/services/message/voice/updateVoiceParticipantMute";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { selectRoomInMessageSchema } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const roomIdInputSchema = z.object({ roomId: selectRoomInMessageSchema.shape.id });
const setMuteInputSchema = z.object({ isMuted: z.boolean(), roomId: selectRoomInMessageSchema.shape.id });
const sendSignalInputSchema = z.object({
  payload: voiceSignalPayloadSchema,
  roomId: selectRoomInMessageSchema.shape.id,
});
const onVoiceInputSchema = selectRoomInMessageSchema.shape.id;

export const voiceRouter = router({
  joinVoiceChannel: getMemberProcedure(roomIdInputSchema, "roomId").mutation<VoiceParticipant[]>(
    ({ ctx, input: { roomId } }) => {
      const { session, user } = ctx.getSessionPayload;
      const participant: VoiceParticipant = {
        id: session.id,
        image: user.image ?? null,
        isMuted: false,
        name: user.name,
        userId: user.id,
      };
      createVoiceParticipant(roomId, participant);
      voiceEventEmitter.emit("joinVoiceChannel", { participant, roomId, sessionId: session.id });
      return getRoomParticipants(roomId);
    },
  ),
  leaveVoiceChannel: getMemberProcedure(roomIdInputSchema, "roomId").mutation(({ ctx, input: { roomId } }) => {
    const sessionId = ctx.getSessionPayload.session.id;
    const wasDeleted = deleteVoiceParticipant(roomId, sessionId);
    if (wasDeleted) voiceEventEmitter.emit("leaveVoiceChannel", { id: sessionId, roomId, sessionId });
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
      if (roomId !== input || sessionId === ctx.getSessionPayload.session.id) continue;
      yield participant;
    }
  }),
  onParticipantLeave: standardAuthedProcedure.input(onVoiceInputSchema).subscription(async function* ({
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
  onSignal: standardAuthedProcedure.input(onVoiceInputSchema).subscription(async function* ({ ctx, input, signal }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ payload, roomId, senderId }] of on(voiceEventEmitter, "signal", { signal })) {
      if (roomId !== input || payload.targetId !== ctx.getSessionPayload.session.id) continue;
      yield { payload, senderId };
    }
  }),
  readVoiceParticipants: getMemberProcedure(roomIdInputSchema, "roomId").query<VoiceParticipant[]>(
    ({ input: { roomId } }) => getRoomParticipants(roomId),
  ),
  sendSignal: getMemberProcedure(sendSignalInputSchema, "roomId").mutation(({ ctx, input: { payload, roomId } }) => {
    const sessionId = ctx.getSessionPayload.session.id;
    const participants = getRoomParticipants(roomId);
    if (!participants.some((p) => p.id === sessionId))
      throw new TRPCError({ code: "FORBIDDEN", message: "Must join voice channel first" });

    if (!participants.some((p) => p.id === payload.targetId))
      throw new TRPCError({ code: "NOT_FOUND", message: "Target participant not found" });

    voiceEventEmitter.emit("signal", { payload, roomId, senderId: sessionId });
  }),
  setMute: getMemberProcedure(setMuteInputSchema, "roomId").mutation(({ ctx, input: { isMuted, roomId } }) => {
    const sessionId = ctx.getSessionPayload.session.id;
    if (!updateVoiceParticipantMute(roomId, sessionId, isMuted))
      throw new TRPCError({ code: "FORBIDDEN", message: "Must join voice channel first" });

    voiceEventEmitter.emit("muteChanged", { id: sessionId, isMuted, roomId });
  }),
});
