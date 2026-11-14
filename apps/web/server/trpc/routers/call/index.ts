import type { JoinCallResult } from "#shared/models/room/call/JoinCallResult";
import type { CallParticipant, CallSessionInMessage } from "@esposter/db-schema";

import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { createCallSessionId } from "#server/services/message/call/createCallSessionId";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { createStandaloneCallSessionId } from "#server/services/message/call/createStandaloneCallSessionId";
import { getCallObject } from "#server/services/message/call/getCallObject";
import { readCallSessionId } from "#server/services/message/call/readCallSessionId";
import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { requireJoinedCallSession } from "#server/services/message/call/requireJoinedCallSession";
import { requireReadableCallSession } from "#server/services/message/call/requireReadableCallSession";
import { requireThreadRoot } from "#server/services/message/call/requireThreadRoot";
import { writeCallSummary } from "#server/services/message/call/writeCallSummary";
import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { router } from "#server/trpc";
import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { knockerRouter } from "#server/trpc/routers/call/knocker";
import { callSessionInputSchema } from "#shared/models/db/call/CallSessionInput";
import { roomCallInputSchema } from "#shared/models/db/call/RoomCallInput";
import { setCameraEnabledInputSchema } from "#shared/models/db/call/SetCameraEnabledInput";
import { setHandRaisedInputSchema } from "#shared/models/db/call/SetHandRaisedInput";
import { setMutedInputSchema } from "#shared/models/db/call/SetMutedInput";
import { checkHasPermission } from "@esposter/db";
import { callSessionIdSchema, DatabaseEntityType, MessageType, RoomPermission } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";

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
      const join = await getCallObject(id).joinCall({
        callSessionId: id,
        isAdmissionRequired: !isCreator,
        participant: createParticipant(session, user),
      });
      if (!join) throw getForbiddenError("Must be admitted to join this call");

      return {
        authToken: join.authToken,
        callSessionId: id,
        isDoorkeeper: isCreator,
        meetingId: join.meetingId,
        participantMap: join.participantMap,
      };
    }),
  joinCallByRoomId: getMemberProcedure(roomCallInputSchema, "roomId").mutation<JoinCallResult>(
    async ({ ctx, input: { roomId, threadRootId } }) => {
      const { session, user } = ctx.getSessionPayload;
      await requireThreadRoot(roomId, threadRootId);
      const callSessionId = await createCallSessionId(ctx.db, roomId, user.id, threadRootId);
      // Nobody knocks on a room call — membership is its door, asked here as the webhook asks it of every connection,
      // So a member timed out of the room is refused a token rather than handed one the webhook then disconnects
      if (!(await checkIsCallConnectionAdmitted(ctx.db, callSessionId, user.id)))
        throw getForbiddenError("You are timed out of this room");

      const join = await getCallObject(callSessionId).joinCall({
        callSessionId,
        isAdmissionRequired: false,
        participant: createParticipant(session, user),
      });
      if (!join) throw getForbiddenError("You are timed out of this room");
      // A call's first join announces it in the thread the call is in, or the room, as a line with no duration yet
      if (join.isFirstJoiner)
        await createSystemRoomMessage(roomId, user.id, "", {
          replyToId: threadRootId || undefined,
          type: MessageType.Call,
        }).match(noop, console.error);

      return {
        authToken: join.authToken,
        callSessionId,
        isDoorkeeper: false,
        meetingId: join.meetingId,
        participantMap: join.participantMap,
      };
    },
  ),
  leaveCall: standardAuthedProcedure
    .input(callSessionIdSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId } }) => {
      const { session } = ctx.getSessionPayload;
      const leave = await getCallObject(callSessionId).leaveCall({ callSessionId, sessionId: session.id });
      if (!leave) throw getNotFoundError(DatabaseEntityType.CallSession, callSessionId);

      await writeCallSummary(ctx.db, callSessionId, leave);
    }),
  readCallParticipantMap: standardAuthedProcedure
    .input(callSessionIdSchema)
    .query<Map<string, CallParticipant>>(async ({ ctx, input: { callSessionId } }) => {
      await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, callSessionId);
      return getCallObject(callSessionId).readParticipantMap();
    }),
  readCallSession: standardAuthedProcedure
    .input(callSessionInputSchema)
    .query<Pick<CallSessionInMessage, "id" | "roomId" | "userId">>(async ({ ctx, input: { id } }) => {
      const callSession = await requireReadableCallSession(ctx.db, ctx.getSessionPayload, id);
      return { id: callSession.id, roomId: callSession.roomId, userId: callSession.userId };
    }),
  readCallSessionId: getMemberProcedure(roomCallInputSchema, "roomId").query<string>(
    ({ ctx, input: { roomId, threadRootId } }) => readCallSessionId(ctx.db, roomId, threadRootId),
  ),
  setCameraEnabled: standardAuthedProcedure
    .input(setCameraEnabledInputSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId, isCameraEnabled } }) => {
      const sessionId = ctx.getSessionPayload.session.id;
      const isUpdated = await getCallObject(callSessionId).setCameraEnabled({
        callSessionId,
        isCameraEnabled,
        sessionId,
      });
      if (!isUpdated) throw getForbiddenError("Must join call first");
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

      const isUpdated = await getCallObject(callSessionId).setHandRaised({
        callSessionId,
        isHandRaised,
        sessionId: targetSessionId,
      });
      if (!isUpdated) throw getForbiddenError("Must join call first");
    }),
  setMuted: standardAuthedProcedure
    .input(setMutedInputSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId, isMuted } }) => {
      const sessionId = ctx.getSessionPayload.session.id;
      const isUpdated = await getCallObject(callSessionId).setMuted({ callSessionId, isMuted, sessionId });
      if (!isUpdated) throw getForbiddenError("Must join call first");
    }),
});

export const callRouter = mergeRouters(baseCallRouter, router({ knocker: knockerRouter }));
