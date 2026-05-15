import { on } from "@@/server/services/events/on";
import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callParticipantMap";
import { createParticipant } from "@@/server/services/message/call/createParticipant";
import { requireCallSession } from "@@/server/services/message/call/requireCallSession";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { ForbiddenError, NotFoundError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const knockCallInputSchema = z.object({ id: selectCallSessionInMessageSchema.shape.id });
const admitKnockerInputSchema = z.object({ callSessionId: z.string(), sessionId: z.string() });
const dismissKnockerInputSchema = z.object({ callSessionId: z.string(), sessionId: z.string() });
const onKnockCallInputSchema = selectCallSessionInMessageSchema.shape.id;
const onKnockerAdmittedInputSchema = selectCallSessionInMessageSchema.shape.id;
const onKnockerDismissedInputSchema = selectCallSessionInMessageSchema.shape.id;

export const knockerRouter = router({
  admitKnocker: standardAuthedProcedure
    .input(admitKnockerInputSchema)
    .mutation(async ({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      const { session: callerSession, user: callerUser } = ctx.getSessionPayload;
      const callerSessionId = callerSession.id;
      if (!callSessionParticipantMap.get(callSessionId)?.has(callerSessionId))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must be in call to admit knockers").message,
        });
      const callSession = await requireCallSession(ctx.db, callSessionId);
      if (callSession.userId !== callerUser.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must be call creator to admit knockers").message,
        });

      const knockerMap = callKnockerMap.get(callSessionId);
      if (!knockerMap?.has(knockerSessionId)) return;
      knockerMap.delete(knockerSessionId);
      let admittedParticipantIds = callAdmittedParticipantMap.get(callSessionId);
      if (!admittedParticipantIds) {
        admittedParticipantIds = new Set();
        callAdmittedParticipantMap.set(callSessionId, admittedParticipantIds);
      }
      admittedParticipantIds.add(knockerSessionId);

      callEventEmitter.emit("knockerAdmitted", { callSessionId, knockerSessionId });
    }),
  dismissKnocker: standardAuthedProcedure
    .input(dismissKnockerInputSchema)
    .mutation(async ({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      const { session: callerSession, user: callerUser } = ctx.getSessionPayload;
      const callerSessionId = callerSession.id;
      if (!callSessionParticipantMap.get(callSessionId)?.has(callerSessionId))
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must be in call to dismiss knockers").message,
        });
      const callSession = await requireCallSession(ctx.db, callSessionId);
      if (callSession.userId !== callerUser.id)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: new ForbiddenError("Must be call creator to dismiss knockers").message,
        });

      const knockerMap = callKnockerMap.get(callSessionId);
      if (!knockerMap?.has(knockerSessionId)) return;
      knockerMap.delete(knockerSessionId);

      callEventEmitter.emit("knockerDismissed", { callSessionId, knockerSessionId });
    }),
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
  onKnockCall: standardAuthedProcedure.input(onKnockCallInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "knockCall", { signal });
    const callSession = await requireCallSession(ctx.db, input);

    const callerSessionId = ctx.getSessionPayload.session.id;
    if (
      !callSessionParticipantMap.get(input)?.has(callerSessionId) ||
      callSession.userId !== ctx.getSessionPayload.user.id
    )
      return;

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
});
