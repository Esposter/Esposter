import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallResult } from "@@/server/models/room/call/JoinCallResult";
import type { CallSessionInMessage } from "@esposter/db-schema";

import { on } from "@@/server/services/events/on";
import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callSessionParticipantMap";
import { createCallSessionId } from "@@/server/services/message/call/createCallSessionId";
import { createParticipant } from "@@/server/services/message/call/createParticipant";
import { createStandaloneCallSessionId } from "@@/server/services/message/call/createStandaloneCallSessionId";
import { joinLiveKitCall } from "@@/server/services/message/call/joinLiveKitCall";
import { leaveCallAsParticipant } from "@@/server/services/message/call/leaveCallAsParticipant";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { requireCallSession } from "@@/server/services/message/call/requireCallSession";
import { requireJoinedCallSession } from "@@/server/services/message/call/requireJoinedCallSession";
import { requireReadableCallSession } from "@@/server/services/message/call/requireReadableCallSession";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { readMessagesByRowKeys } from "@@/server/services/message/readMessagesByRowKeys";
import { router } from "@@/server/trpc";
import { getForbiddenError } from "@@/server/trpc/guards/getForbiddenError";
import { getNotFoundError } from "@@/server/trpc/guards/getNotFoundError";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { knockerRouter } from "@@/server/trpc/routers/call/knocker";
import { checkHasPermission } from "@esposter/db";
import {
  AzureEntityType,
  callSessionIdSchema,
  DatabaseEntityType,
  roomIdSchema,
  RoomPermission,
  selectCallSessionInMessageSchema,
} from "@esposter/db-schema";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";
import { z } from "zod";

// One call session addressed by its own id — every subscription and the two id-only procedures take it
const callSessionIdInputSchema = selectCallSessionInMessageSchema.shape.id;
const callSessionInputSchema = z.object({ id: callSessionIdInputSchema });
// A room call and a thread call are the same call addressed by where it is: the empty root rowKey is the
// Room's own, which is what every existing caller sends
const roomCallInputSchema = z.object({
  ...roomIdSchema.shape,
  threadRootRowKey: z.string().default(""),
});
const setCameraEnabledInputSchema = z.object({ ...callSessionIdSchema.shape, isCameraEnabled: z.boolean() });
const setHandRaisedInputSchema = z.object({
  ...callSessionIdSchema.shape,
  isHandRaised: z.boolean(),
  participantId: z.string(),
});
const setMutedInputSchema = z.object({ ...callSessionIdSchema.shape, isMuted: z.boolean() });
// The live participant row is the only place a per-session flag lives, so every setter reaches it the same
// Way — a session with no row has not joined, whether it is the caller's own or the target of a moderation
const requireCallParticipant = (callSessionId: string, sessionId: string) => {
  const participant = callSessionParticipantMap.get(callSessionId)?.get(sessionId);
  if (!participant) throw getForbiddenError("Must join call first");
  return participant;
};
// A thread call hangs off the message its thread is rooted at, and that rowKey is written onto every join and
// Leave message as the replyRowKey. Membership does not bound it and the session's unique index rejects only
// Exact duplicates, so an unknown rowKey would open a session of its own whose messages reply to nothing
const requireThreadRoot = async (roomId: string, threadRootRowKey: string) => {
  if (!threadRootRowKey) return;

  const [message] = await readMessagesByRowKeys(roomId, [threadRootRowKey]);
  if (!message) throw getNotFoundError(AzureEntityType.Message, threadRootRowKey);
};

export const baseCallRouter = router({
  createCall: standardAuthedProcedure.mutation<{ callSessionId: CallSessionInMessage["id"] }>(async ({ ctx }) => {
    const callSessionId = await createStandaloneCallSessionId(ctx.db, ctx.getSessionPayload.user.id);
    return { callSessionId };
  }),
  joinCall: standardAuthedProcedure
    .input(callSessionInputSchema)
    .mutation<JoinCallResult>(async ({ ctx, input: { id } }) => {
      const callSession = await requireCallSession(ctx.db, id);
      if (callSession.roomId) throw getForbiddenError("Room calls must be joined via joinCallByRoomId");

      const { session, user } = ctx.getSessionPayload;
      const isCreator = callSession.userId === user.id;
      const isAdmitted = callAdmittedParticipantMap.get(id)?.has(session.id) ?? false;
      if (!isCreator && !isAdmitted) throw getForbiddenError("Must be admitted to join this call");

      callAdmittedParticipantMap.get(id)?.delete(session.id);
      return joinLiveKitCall(callSession, createParticipant(session, user), user.id);
    }),
  joinCallByRoomId: getMemberProcedure(roomCallInputSchema, "roomId").mutation<JoinCallResult>(
    async ({ ctx, input: { roomId, threadRootRowKey } }) => {
      const { session, user } = ctx.getSessionPayload;
      await requireThreadRoot(roomId, threadRootRowKey);
      const callSessionId = await createCallSessionId(ctx.db, roomId, user.id, threadRootRowKey);
      return joinLiveKitCall(
        { id: callSessionId, roomId, threadRootRowKey },
        createParticipant(session, user),
        user.id,
      );
    },
  ),
  leaveCall: standardAuthedProcedure
    .input(callSessionIdSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId } }) => {
      const { session, user } = ctx.getSessionPayload;
      const isDeleted = await leaveCallAsParticipant(ctx.db, callSessionId, session.id, user.id);
      if (!isDeleted) throw getNotFoundError(DatabaseEntityType.CallSession, callSessionId);
    }),
  onJoinCall: standardAuthedProcedure.input(callSessionIdInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "joinCall", { signal });
    await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ callSessionId, participant, sessionId }] of events) {
      if (callSessionId !== input || sessionId === ctx.getSessionPayload.session.id) continue;
      yield participant;
    }
  }),
  onLeaveCall: standardAuthedProcedure.input(callSessionIdInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "leaveCall", { signal });
    await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ callSessionId, id }] of events) {
      if (callSessionId !== input || id === ctx.getSessionPayload.session.id) continue;
      yield id;
    }
  }),
  onSetCameraEnabled: standardAuthedProcedure.input(callSessionIdInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "videoChanged", { signal });
    await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ callSessionId, id, isCameraEnabled }] of events) {
      if (callSessionId !== input) continue;
      yield { id, isCameraEnabled };
    }
  }),
  onSetHandRaised: standardAuthedProcedure.input(callSessionIdInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "handRaisedChanged", { signal });
    await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ callSessionId, id, isHandRaised }] of events) {
      if (callSessionId !== input) continue;
      yield { id, isHandRaised };
    }
  }),
  onSetMuted: standardAuthedProcedure.input(callSessionIdInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "muteChanged", { signal });
    await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ callSessionId, id, isMuted }] of events) {
      if (callSessionId !== input) continue;
      yield { id, isMuted };
    }
  }),
  readCallParticipantMap: standardAuthedProcedure
    .input(callSessionIdSchema)
    .query<Map<string, CallParticipant>>(async ({ ctx, input: { callSessionId } }) => {
      await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, callSessionId);
      return callSessionParticipantMap.get(callSessionId) ?? new Map();
    }),
  readCallSession: standardAuthedProcedure
    .input(callSessionInputSchema)
    .query<Pick<CallSessionInMessage, "id" | "roomId" | "userId">>(async ({ ctx, input: { id } }) => {
      const callSession = await requireReadableCallSession(ctx.db, ctx.getSessionPayload, id);
      return { id: callSession.id, roomId: callSession.roomId, userId: callSession.userId };
    }),
  readCallSessionId: getMemberProcedure(roomCallInputSchema, "roomId").query<string>(
    ({ ctx, input: { roomId, threadRootRowKey } }) => readCallSessionId(ctx.db, roomId, threadRootRowKey),
  ),
  setCameraEnabled: standardAuthedProcedure
    .input(setCameraEnabledInputSchema)
    .mutation<void>(({ ctx, input: { callSessionId, isCameraEnabled } }) => {
      const sessionId = ctx.getSessionPayload.session.id;
      requireCallParticipant(callSessionId, sessionId).isCameraEnabled = isCameraEnabled;

      callEventEmitter.emit("videoChanged", { callSessionId, id: sessionId, isCameraEnabled });
    }),
  setHandRaised: standardAuthedProcedure
    .input(setHandRaisedInputSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId, isHandRaised, participantId: targetSessionId } }) => {
      const callSession = await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, callSessionId);
      const sessionId = ctx.getSessionPayload.session.id;
      if (targetSessionId !== sessionId) {
        if (isHandRaised) throw getForbiddenError("Cannot raise another hand");
        else if (!callSession.roomId) throw getForbiddenError("Only room call moderators can lower another hand");

        const hasMuteMembersPermission = await checkHasPermission(
          ctx.db,
          ctx.getSessionPayload.user.id,
          callSession.roomId,
          RoomPermission.MuteMembers,
        );
        if (!hasMuteMembersPermission) throw getForbiddenError("Missing permission to lower another hand");
      }

      requireCallParticipant(callSessionId, targetSessionId).isHandRaised = isHandRaised;

      callEventEmitter.emit("handRaisedChanged", { callSessionId, id: targetSessionId, isHandRaised });
    }),
  setMuted: standardAuthedProcedure
    .input(setMutedInputSchema)
    .mutation<void>(({ ctx, input: { callSessionId, isMuted } }) => {
      const sessionId = ctx.getSessionPayload.session.id;
      requireCallParticipant(callSessionId, sessionId).isMuted = isMuted;

      callEventEmitter.emit("muteChanged", { callSessionId, id: sessionId, isMuted });
    }),
});

export const callRouter = mergeRouters(baseCallRouter, router({ knocker: knockerRouter }));
