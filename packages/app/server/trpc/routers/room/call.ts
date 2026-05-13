import type { CallParticipant } from "#shared/models/room/call/CallParticipant";

import { createId } from "#shared/util/math/random/createId";
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
  CALL_ID_LENGTH,
  callSessionIdSchema,
  callSessionsInMessage,
  DatabaseEntityType,
  MessageType,
  roomIdSchema,
  selectCallSessionInMessageSchema,
} from "@esposter/db-schema";
import { ForbiddenError, getResultAsync, InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { AccessToken, RoomServiceClient, TrackSource } from "livekit-server-sdk";
import { useRuntimeConfig } from "nitropack/runtime";
import { z } from "zod";

const joinCallByRoomIdInputSchema = roomIdSchema;
const joinCallInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
const leaveCallInputSchema = callSessionIdSchema;
const setCameraInputSchema = z.object({ ...callSessionIdSchema.shape, isCameraEnabled: z.boolean() });
const setMuteInputSchema = z.object({ ...callSessionIdSchema.shape, isMuted: z.boolean() });
const readCallSessionIdInputSchema = roomIdSchema;
const readCallParticipantsInputSchema = callSessionIdSchema;
const onJoinCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onLeaveCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onSetMuteInputSchema = selectCallSessionInMessageSchema.shape.id;
const onVideoChangedInputSchema = selectCallSessionInMessageSchema.shape.id;

interface JoinCallOutput {
  callSessionId: string;
  livekitToken: string;
  livekitUrl: string;
  participants: CallParticipant[];
}

const createLiveKitRoom = async (callSessionId: string) => {
  const { livekit } = useRuntimeConfig();
  if (!livekit?.url || !livekit.apiKey || !livekit.apiSecret) return;

  const roomServiceClient = new RoomServiceClient(livekit.url, livekit.apiKey, livekit.apiSecret);
  const rooms = await roomServiceClient.listRooms([callSessionId]);
  if (rooms.some(({ name }) => name === callSessionId)) return;
  await roomServiceClient.createRoom({ emptyTimeout: 60, name: callSessionId });
};

const createLiveKitToken = async (callSessionId: string, participant: CallParticipant) => {
  const { livekit } = useRuntimeConfig();
  if (!livekit?.url || !livekit.apiKey || !livekit.apiSecret) return { livekitToken: "", livekitUrl: "" };

  const token = new AccessToken(livekit.apiKey, livekit.apiSecret, {
    identity: participant.id,
    metadata: JSON.stringify({ userId: participant.userId }),
    name: participant.name,
  });
  token.addGrant({
    canPublish: true,
    canPublishSources: [
      TrackSource.MICROPHONE,
      TrackSource.CAMERA,
      TrackSource.SCREEN_SHARE,
      TrackSource.SCREEN_SHARE_AUDIO,
    ],
    canSubscribe: true,
    room: callSessionId,
    roomJoin: true,
  });
  return { livekitToken: await token.toJwt(), livekitUrl: livekit.url };
};

const setParticipantCamera = (callSessionId: string, id: string, isCameraEnabled: boolean) => {
  const participant = getCallParticipants(callSessionId).find((p) => p.id === id);
  if (!participant) return false;
  participant.isCameraEnabled = isCameraEnabled;
  return true;
};

const createParticipant = (session: { id: string }, user: { id: string; image?: null | string; name: string }) =>
  ({
    id: session.id,
    image: user.image ?? null,
    isCameraEnabled: false,
    isMuted: false,
    name: user.name,
    userId: user.id,
  }) satisfies CallParticipant;

const createCallSessionId = async (db: Parameters<typeof readCallSessionId>[0], roomId: string) => {
  const existingId = await readCallSessionId(db, roomId);
  if (existingId) return existingId;

  let createdId: string | undefined;
  for (let i = 0; i < 3; i++) {
    const id = createId(CALL_ID_LENGTH);
    const insertResult = await getResultAsync(() =>
      db.insert(callSessionsInMessage).values({ id, roomId }).returning(),
    );
    const result = insertResult.orTee(console.error).unwrapOr(null);
    if (!result?.[0]) continue;
    createdId = result[0].id;
    break;
  }
  if (createdId) return createdId;

  const fallback = await db.query.callSessionsInMessage.findFirst({ where: { roomId: { eq: roomId } } });
  if (!fallback)
    throw new TRPCError({
      code: "UNPROCESSABLE_CONTENT",
      message: new InvalidOperationError(Operation.Create, DatabaseEntityType.CallSession, roomId).message,
    });
  return fallback.id;
};

const joinLiveKitCall = async (
  callSession: { id: string; roomId: string },
  participant: CallParticipant,
  userId: string,
): Promise<JoinCallOutput> => {
  await createLiveKitRoom(callSession.id);
  const livekit = await createLiveKitToken(callSession.id, participant);
  const result = await joinCallAsParticipant(callSession, participant, participant.id, userId);
  return { ...result, ...livekit };
};

export const callRouter = router({
  joinCall: standardAuthedProcedure
    .input(joinCallInputSchema)
    .mutation<JoinCallOutput>(async ({ ctx, input: { id } }) => {
      const callSession = await ctx.db.query.callSessionsInMessage.findFirst({
        where: { id: { eq: id } },
      });
      if (!callSession)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.CallSession, id).message,
        });

      const { session, user } = ctx.getSessionPayload;
      return joinLiveKitCall(callSession, createParticipant(session, user), user.id);
    }),
  joinCallByRoomId: getMemberProcedure(joinCallByRoomIdInputSchema, "roomId").mutation<JoinCallOutput>(
    async ({ ctx, input: { roomId } }) => {
      const { session, user } = ctx.getSessionPayload;
      const callSessionId = await createCallSessionId(ctx.db, roomId);
      return joinLiveKitCall({ id: callSessionId, roomId }, createParticipant(session, user), user.id);
    },
  ),
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
  onSetMute: standardAuthedProcedure.input(onSetMuteInputSchema).subscription(async function* ({ ctx, input, signal }) {
    const events = on(callEventEmitter, "muteChanged", { signal });
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, id, isMuted }] of events) {
      if (callSessionId !== input) continue;
      yield { id, isMuted };
    }
  }),
  onVideoChanged: standardAuthedProcedure.input(onVideoChangedInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "videoChanged", { signal });
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, id, isCameraEnabled }] of events) {
      if (callSessionId !== input) continue;
      yield { id, isCameraEnabled };
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
  setCamera: standardAuthedProcedure
    .input(setCameraInputSchema)
    .mutation(({ ctx, input: { callSessionId, isCameraEnabled } }) => {
      const sessionId = ctx.getSessionPayload.session.id;
      if (!setParticipantCamera(callSessionId, sessionId, isCameraEnabled))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must join call first").message,
        });

      callEventEmitter.emit("videoChanged", { callSessionId, id: sessionId, isCameraEnabled });
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
