import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallOutput } from "@@/server/models/room/call/JoinCallOutput";

import { on } from "@@/server/services/events/on";
import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { createCallSessionId } from "@@/server/services/message/call/createCallSessionId";
import { createParticipant } from "@@/server/services/message/call/createParticipant";
import { createStandaloneCallSessionId } from "@@/server/services/message/call/createStandaloneCallSessionId";
import { getCallParticipants } from "@@/server/services/message/call/getCallParticipants";
import { joinLiveKitCall } from "@@/server/services/message/call/joinLiveKitCall";
import { leaveCallAsParticipant } from "@@/server/services/message/call/leaveCallAsParticipant";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { requireJoinedCallSession } from "@@/server/services/message/call/requireJoinedCallSession";
import { requireReadableCallSession } from "@@/server/services/message/call/requireReadableCallSession";
import { setParticipantCamera } from "@@/server/services/message/call/setParticipantCamera";
import { updateCallParticipantMute } from "@@/server/services/message/call/updateCallParticipantMute";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { knockerRouter } from "@@/server/trpc/routers/call/knocker";
import {
  callSessionIdSchema,
  DatabaseEntityType,
  roomIdSchema,
  selectCallSessionInMessageSchema,
} from "@esposter/db-schema";
import { ForbiddenError, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { mergeRouters } from "@trpc/server/unstable-core-do-not-import";
import { z } from "zod";

const joinCallByRoomIdInputSchema = roomIdSchema;
const joinCallInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
const leaveCallInputSchema = callSessionIdSchema;
const setCameraInputSchema = z.object({ ...callSessionIdSchema.shape, isCameraEnabled: z.boolean() });
const setMuteInputSchema = z.object({ ...callSessionIdSchema.shape, isMuted: z.boolean() });
const readCallSessionIdInputSchema = roomIdSchema;
const readCallSessionInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
const readCallParticipantsInputSchema = callSessionIdSchema;
const onJoinCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onLeaveCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onSetMuteInputSchema = selectCallSessionInMessageSchema.shape.id;
const onVideoChangedInputSchema = selectCallSessionInMessageSchema.shape.id;

export const baseCallRouter = router({
  createCall: standardAuthedProcedure.mutation(async ({ ctx }) => {
    const callSessionId = await createStandaloneCallSessionId(ctx.db, ctx.getSessionPayload.user.id);
    return { callSessionId };
  }),
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
      else if (callSession.roomId)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Room calls must be joined via joinCallByRoomId").message,
        });

      const { session, user } = ctx.getSessionPayload;
      const isCreator = callSession.userId === user.id;
      const isAdmitted = callAdmittedParticipantMap.get(id)?.has(session.id) ?? false;
      if (!isCreator && !isAdmitted)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must be admitted to join this call").message,
        });
      callAdmittedParticipantMap.get(id)?.delete(session.id);
      return joinLiveKitCall(callSession, createParticipant(session, user), user.id);
    }),
  joinCallByRoomId: getMemberProcedure(joinCallByRoomIdInputSchema, "roomId").mutation<JoinCallOutput>(
    async ({ ctx, input: { roomId } }) => {
      const { session, user } = ctx.getSessionPayload;
      const callSessionId = await createCallSessionId(ctx.db, roomId, user.id);
      return joinLiveKitCall({ id: callSessionId, roomId }, createParticipant(session, user), user.id);
    },
  ),
  leaveCall: standardAuthedProcedure.input(leaveCallInputSchema).mutation(async ({ ctx, input: { callSessionId } }) => {
    const { session, user } = ctx.getSessionPayload;
    const isDeleted = await leaveCallAsParticipant(ctx.db, callSessionId, session.id, user.id);
    if (!isDeleted)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.CallSession, session.id).message,
      });
  }),
  onJoinCall: standardAuthedProcedure.input(onJoinCallInputSchema).subscription(async function* ({
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
  onLeaveCall: standardAuthedProcedure.input(onLeaveCallInputSchema).subscription(async function* ({
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
  onSetMute: standardAuthedProcedure.input(onSetMuteInputSchema).subscription(async function* ({ ctx, input, signal }) {
    const events = on(callEventEmitter, "muteChanged", { signal });
    await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, input);

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
    await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, input);

    for await (const [{ callSessionId, id, isCameraEnabled }] of events) {
      if (callSessionId !== input) continue;
      yield { id, isCameraEnabled };
    }
  }),
  readCallParticipants: standardAuthedProcedure
    .input(readCallParticipantsInputSchema)
    .query<CallParticipant[]>(async ({ ctx, input: { callSessionId } }) => {
      await requireJoinedCallSession(ctx.db, ctx.getSessionPayload, callSessionId);
      return getCallParticipants(callSessionId);
    }),
  readCallSession: standardAuthedProcedure.input(readCallSessionInputSchema).query(async ({ ctx, input: { id } }) => {
    const callSession = await requireReadableCallSession(ctx.db, ctx.getSessionPayload, id);
    return { id: callSession.id, roomId: callSession.roomId, userId: callSession.userId };
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

export const callRouter = mergeRouters(baseCallRouter, router({ knocker: knockerRouter }));
