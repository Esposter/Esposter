import type { JoinCallResult } from "#shared/models/room/call/JoinCallResult";
import type { CallParticipant, CallSessionInMessage } from "@esposter/db-schema";

import { useCallObject } from "#server/composables/realtime/useCallObject";
import { useUserObject } from "#server/composables/realtime/useUserObject";
import { checkIsCallConnectionAdmitted } from "#server/services/message/call/checkIsCallConnectionAdmitted";
import { createCallSessionId } from "#server/services/message/call/createCallSessionId";
import { createParticipant } from "#server/services/message/call/createParticipant";
import { createStandaloneCallSessionId } from "#server/services/message/call/createStandaloneCallSessionId";
import { readCallSessionId } from "#server/services/message/call/readCallSessionId";
import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { requireJoinedCallSession } from "#server/services/message/call/requireJoinedCallSession";
import { requireReadableCallSession } from "#server/services/message/call/requireReadableCallSession";
import { requireThreadRoot } from "#server/services/message/call/requireThreadRoot";
import { writeCallSummary } from "#server/services/message/call/writeCallSummary";
import { createSystemRoomMessage } from "#server/services/message/createSystemRoomMessage";
import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { router } from "#server/trpc/index";
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
  createCall: standardAuthedProcedure
    .meta({
      staticReason:
        "Its id goes to its creator alone, and the call's state is pushed by its call object as typed events",
    })
    .mutation<{ callSessionId: CallSessionInMessage["id"] }>(async ({ ctx }) => {
      const callSessionId = await createStandaloneCallSessionId(ctx.db, ctx.user.id);
      return { callSessionId };
    }),
  joinCall: standardAuthedProcedure
    .input(callSessionInputSchema)
    .meta({ staticReason: "The call object pushes the join to its sockets as a typed event" })
    .mutation<JoinCallResult>(async ({ ctx, input: { id } }) => {
      const callSession = await requireCallSession(ctx.db, id);
      if (callSession.roomId) throw getForbiddenError("Room calls must be joined via joinCallByRoomId");

      const { session, user } = ctx;
      const isCreator = callSession.userId === user.id;
      const join = await useCallObject(id).joinCall({
        callSessionId: id,
        isAdmissionRequired: !isCreator,
        participant: createParticipant(session, user),
      });
      if (!join) throw getForbiddenError("Must be admitted to join this call");
      // No D1 row names who was admitted to a call without a room, so the person's object keeps it for a revoked session
      if (!isCreator) await useUserObject(user.id).addJoinedCall(id);

      return {
        authToken: join.authToken,
        callSessionId: id,
        isDoorkeeper: isCreator,
        meetingId: join.meetingId,
        participantMap: join.participantMap,
      };
    }),
  joinCallByRoomId: getMemberProcedure(roomCallInputSchema, "roomId")
    .meta({ staticReason: "The call object pushes the join to its sockets as a typed event" })
    .mutation<JoinCallResult>(async ({ ctx, input: { roomId, threadRootId } }) => {
      const { session, user } = ctx;
      await requireThreadRoot(roomId, threadRootId);
      const callSessionId = await createCallSessionId(ctx.db, roomId, user.id, threadRootId);
      // Nobody knocks on a room call — membership is its door, asked here as the webhook asks it of every connection,
      // So a member timed out of the room is refused a token rather than handed one the webhook then disconnects
      if (!(await checkIsCallConnectionAdmitted(ctx.db, callSessionId, user.id)))
        throw getForbiddenError("You are timed out of this room");

      const join = await useCallObject(callSessionId).joinCall({
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
    }),
  leaveCall: standardAuthedProcedure
    .input(callSessionIdSchema)
    .meta({ staticReason: "The call object pushes the departure to its sockets as a typed event" })
    .mutation<void>(async ({ ctx, input: { callSessionId } }) => {
      const { session } = ctx;
      const leave = await useCallObject(callSessionId).leaveCall({ callSessionId, sessionId: session.id });
      if (!leave) throw getNotFoundError(DatabaseEntityType.CallSession, callSessionId);

      await writeCallSummary(ctx.db, callSessionId, leave);
    }),
  readCallParticipantMap: standardAuthedProcedure
    .input(callSessionIdSchema)
    .meta({ staticReason: "The call object pushes participant changes to its sockets as typed events" })
    .query<Map<string, CallParticipant>>(async ({ ctx, input: { callSessionId } }) => {
      await requireJoinedCallSession(ctx, callSessionId);
      return useCallObject(callSessionId).readParticipantMap();
    }),
  readCallSession: standardAuthedProcedure
    .input(callSessionInputSchema)
    .meta({ staticReason: "A call session's room and owner are fixed when it starts, so nothing it returns changes" })
    .query<Pick<CallSessionInMessage, "id" | "roomId" | "userId">>(async ({ ctx, input: { id } }) => {
      const callSession = await requireReadableCallSession(ctx, id);
      return { id: callSession.id, roomId: callSession.roomId, userId: callSession.userId };
    }),
  readCallSessionId: getMemberProcedure(roomCallInputSchema, "roomId")
    .meta({
      staticReason:
        "A room's call is announced in the room, and its participants are pushed by the call object as typed events",
    })
    .query<string>(({ ctx, input: { roomId, threadRootId } }) => readCallSessionId(ctx.db, roomId, threadRootId)),
  setCameraEnabled: standardAuthedProcedure
    .input(setCameraEnabledInputSchema)
    .meta({ staticReason: "The call object pushes the camera change to its sockets as a typed event" })
    .mutation<void>(async ({ ctx, input: { callSessionId, isCameraEnabled } }) => {
      const sessionId = ctx.session.id;
      const isUpdated = await useCallObject(callSessionId).setCameraEnabled({
        callSessionId,
        isCameraEnabled,
        sessionId,
      });
      if (!isUpdated) throw getForbiddenError("Must join call first");
    }),
  setHandRaised: standardAuthedProcedure
    .input(setHandRaisedInputSchema)
    .meta({ staticReason: "The call object pushes the hand change to its sockets as a typed event" })
    .mutation<void>(async ({ ctx, input: { callSessionId, isHandRaised, participantId: targetSessionId } }) => {
      const callSession = await requireJoinedCallSession(ctx, callSessionId);
      const sessionId = ctx.session.id;
      if (targetSessionId !== sessionId) {
        if (isHandRaised) throw getForbiddenError("Cannot raise another hand");
        else if (!callSession.roomId) throw getForbiddenError("Only room call moderators can lower another hand");

        const hasMuteMembersPermission = await checkHasPermission(
          ctx.db,
          ctx.user.id,
          callSession.roomId,
          RoomPermission.MuteMembers,
        );
        if (!hasMuteMembersPermission) throw getForbiddenError("Missing permission to lower another hand");
      }

      const isUpdated = await useCallObject(callSessionId).setHandRaised({
        callSessionId,
        isHandRaised,
        sessionId: targetSessionId,
      });
      if (!isUpdated) throw getForbiddenError("Must join call first");
    }),
  setMuted: standardAuthedProcedure
    .input(setMutedInputSchema)
    .meta({ staticReason: "The call object pushes the mute change to its sockets as a typed event" })
    .mutation<void>(async ({ ctx, input: { callSessionId, isMuted } }) => {
      const sessionId = ctx.session.id;
      const isUpdated = await useCallObject(callSessionId).setMuted({ callSessionId, isMuted, sessionId });
      if (!isUpdated) throw getForbiddenError("Must join call first");
    }),
});

export const callRouter = mergeRouters(baseCallRouter, router({ knocker: knockerRouter }));
