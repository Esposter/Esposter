import type { CallParticipant } from "#shared/models/room/call/CallParticipant";
import type { JoinCallOutput } from "@@/server/models/room/call/JoinCallOutput";

import { on } from "@@/server/services/events/on";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { createCallSessionId } from "@@/server/services/message/call/createCallSessionId";
import { createParticipant } from "@@/server/services/message/call/createParticipant";
import { createStandaloneCallSessionId } from "@@/server/services/message/call/createStandaloneCallSessionId";
import { getCallParticipants } from "@@/server/services/message/call/getCallParticipants";
import { joinLiveKitCall } from "@@/server/services/message/call/joinLiveKitCall";
import { leaveCallAsParticipant } from "@@/server/services/message/call/leaveCallAsParticipant";
import { readCallSessionId } from "@@/server/services/message/call/readCallSessionId";
import { requireCallSession } from "@@/server/services/message/call/requireCallSession";
import { setParticipantCamera } from "@@/server/services/message/call/setParticipantCamera";
import { updateCallParticipantMute } from "@@/server/services/message/call/updateCallParticipantMute";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import {
  callSessionIdSchema,
  DatabaseEntityType,
  roomIdSchema,
  selectCallSessionInMessageSchema,
} from "@esposter/db-schema";
import { ForbiddenError, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const joinCallByRoomIdInputSchema = roomIdSchema;
const joinCallInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
const knockCallInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
const admitKnockerInputSchema = z.object({ callSessionId: z.string(), sessionId: z.string() });
const dismissKnockerInputSchema = z.object({ callSessionId: z.string(), sessionId: z.string() });
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
const onKnockCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onKnockerAdmittedInputSchema = selectCallSessionInMessageSchema.shape.id;
const onKnockerDismissedInputSchema = selectCallSessionInMessageSchema.shape.id;

export const callRouter = router({
  admitKnocker: standardAuthedProcedure
    .input(admitKnockerInputSchema)
    .mutation(({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      const callerSessionId = ctx.getSessionPayload.session.id;
      if (!callSessionParticipantMap.get(callSessionId)?.has(callerSessionId))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must be in call to admit knockers").message,
        });

      const knockerMap = callKnockerMap.get(callSessionId);
      if (!knockerMap?.has(knockerSessionId)) return;
      knockerMap.delete(knockerSessionId);

      callEventEmitter.emit("knockerAdmitted", { callSessionId, knockerSessionId });
    }),
  createCall: standardAuthedProcedure.mutation(async ({ ctx }) => {
    const callSessionId = await createStandaloneCallSessionId(ctx.db);
    return { callSessionId };
  }),
  dismissKnocker: standardAuthedProcedure
    .input(dismissKnockerInputSchema)
    .mutation(({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      const callerSessionId = ctx.getSessionPayload.session.id;
      if (!callSessionParticipantMap.get(callSessionId)?.has(callerSessionId))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must be in call to dismiss knockers").message,
        });

      const knockerMap = callKnockerMap.get(callSessionId);
      if (!knockerMap?.has(knockerSessionId)) return;
      knockerMap.delete(knockerSessionId);

      callEventEmitter.emit("knockerDismissed", { callSessionId, knockerSessionId });
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
      return joinLiveKitCall(callSession, createParticipant(session, user), user.id);
    }),
  joinCallByRoomId: getMemberProcedure(joinCallByRoomIdInputSchema, "roomId").mutation<JoinCallOutput>(
    async ({ ctx, input: { roomId } }) => {
      const { session, user } = ctx.getSessionPayload;
      const callSessionId = await createCallSessionId(ctx.db, roomId);
      return joinLiveKitCall({ id: callSessionId, roomId }, createParticipant(session, user), user.id);
    },
  ),
  knockCall: standardAuthedProcedure.input(knockCallInputSchema).mutation(async ({ ctx, input: { id } }) => {
    const callSession = await ctx.db.query.callSessionsInMessage.findFirst({
      where: { id: { eq: id } },
    });
    if (!callSession)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.CallSession, id).message,
      });
    if (callSession.roomId)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: new ForbiddenError("Room calls cannot be knocked — join via joinCallByRoomId").message,
      });

    const { session, user } = ctx.getSessionPayload;
    const knocker = createParticipant(session, user);

    let knockerMap = callKnockerMap.get(id);
    if (!knockerMap) {
      knockerMap = new Map();
      callKnockerMap.set(id, knockerMap);
    }
    knockerMap.set(session.id, knocker);

    callEventEmitter.emit("knockCall", { callSessionId: id, knocker, knockerSessionId: session.id });
  }),
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
    await requireCallSession(ctx.db, input);

    for await (const [{ callSessionId, participant, sessionId }] of events) {
      if (callSessionId !== input || sessionId === ctx.getSessionPayload.session.id) continue;
      yield participant;
    }
  }),
  onKnockCall: standardAuthedProcedure.input(onKnockCallInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "knockCall", { signal });
    await requireCallSession(ctx.db, input);

    const callerSessionId = ctx.getSessionPayload.session.id;
    if (!callSessionParticipantMap.get(input)?.has(callerSessionId))
      throw new TRPCError({
        code: "FORBIDDEN",
        message: new ForbiddenError("Must be in call to receive knock notifications").message,
      });

    for await (const [{ callSessionId, knocker }] of events) {
      if (callSessionId !== input) continue;
      yield knocker;
    }
  }),
  onKnockerAdmitted: standardAuthedProcedure.input(onKnockerAdmittedInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "knockerAdmitted", { signal });
    await requireCallSession(ctx.db, input);

    const callerSessionId = ctx.getSessionPayload.session.id;

    for await (const [{ callSessionId, knockerSessionId }] of events) {
      if (callSessionId !== input || knockerSessionId !== callerSessionId) continue;
      yield undefined;
    }
  }),
  onKnockerDismissed: standardAuthedProcedure.input(onKnockerDismissedInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "knockerDismissed", { signal });
    await requireCallSession(ctx.db, input);

    const callerSessionId = ctx.getSessionPayload.session.id;

    for await (const [{ callSessionId, knockerSessionId }] of events) {
      if (callSessionId !== input || knockerSessionId !== callerSessionId) continue;
      yield undefined;
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
  readCallSession: standardAuthedProcedure.input(readCallSessionInputSchema).query(async ({ ctx, input: { id } }) => {
    const callSession = await ctx.db.query.callSessionsInMessage.findFirst({
      columns: { id: true, roomId: true },
      where: { id: { eq: id } },
    });
    if (!callSession)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new NotFoundError(DatabaseEntityType.CallSession, id).message,
      });
    return callSession;
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
