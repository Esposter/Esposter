import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { Context } from "@@/server/trpc/context";

import { on } from "@@/server/services/events/on";
import { callAdmittedParticipantMap } from "@@/server/services/message/call/callAdmittedParticipantMap";
import { callKnockerMap } from "@@/server/services/message/call/callKnockerMap";
import { callSessionParticipantMap } from "@@/server/services/message/call/callSessionParticipantMap";
import { createParticipant } from "@@/server/services/message/call/createParticipant";
import { requireCallSession } from "@@/server/services/message/call/requireCallSession";
import { requireKnockerCallSession } from "@@/server/services/message/call/requireKnockerCallSession";
import { callEventEmitter } from "@@/server/services/message/events/callEventEmitter";
import { router } from "@@/server/trpc";
import { getForbiddenError } from "@@/server/trpc/guards/getForbiddenError";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { selectCallSessionInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

const callSessionIdInputSchema = selectCallSessionInMessageSchema.shape.id;
const callSessionInputSchema = z.object({ id: callSessionIdInputSchema });
const knockerInputSchema = z.object({ callSessionId: z.string(), sessionId: z.string() });

// Only the creator, and only while they are themselves in the call, decides who gets in — for admitting and
// Dismissing alike
const requireCallDoorkeeper = async (
  db: Context["db"],
  sessionPayload: GetSessionPayload,
  callSessionId: string,
  action: string,
) => {
  const { session: callerSession, user: callerUser } = sessionPayload;
  if (!callSessionParticipantMap.get(callSessionId)?.has(callerSession.id))
    throw getForbiddenError(`Must be in call to ${action} knockers`);

  const callSession = await requireCallSession(db, callSessionId);
  if (callSession.userId !== callerUser.id) throw getForbiddenError(`Must be call creator to ${action} knockers`);
  return callSession;
};

export const knockerRouter = router({
  admitKnocker: standardAuthedProcedure
    .input(knockerInputSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      await requireCallDoorkeeper(ctx.db, ctx.getSessionPayload, callSessionId, "admit");

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
    .input(knockerInputSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      await requireCallDoorkeeper(ctx.db, ctx.getSessionPayload, callSessionId, "dismiss");

      const knockerMap = callKnockerMap.get(callSessionId);
      if (!knockerMap?.has(knockerSessionId)) return;
      knockerMap.delete(knockerSessionId);

      callEventEmitter.emit("knockerDismissed", { callSessionId, knockerSessionId });
    }),
  knockCall: standardAuthedProcedure.input(callSessionInputSchema).mutation<void>(async ({ ctx, input: { id } }) => {
    const callSession = await requireCallSession(ctx.db, id);
    if (callSession.roomId) throw getForbiddenError("Room calls cannot be knocked — join via joinCallByRoomId");

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
  onKnockCall: standardAuthedProcedure.input(callSessionIdInputSchema).subscription(async function* ({
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
  onKnockerAdmitted: standardAuthedProcedure.input(callSessionIdInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "knockerAdmitted", { signal });
    await requireKnockerCallSession(ctx.db, ctx.getSessionPayload, input);

    const callerSessionId = ctx.getSessionPayload.session.id;

    for await (const [{ callSessionId, knockerSessionId }] of events) {
      if (callSessionId !== input || knockerSessionId !== callerSessionId) continue;
      yield undefined;
    }
  }),
  onKnockerDismissed: standardAuthedProcedure.input(callSessionIdInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    const events = on(callEventEmitter, "knockerDismissed", { signal });
    await requireKnockerCallSession(ctx.db, ctx.getSessionPayload, input);

    const callerSessionId = ctx.getSessionPayload.session.id;

    for await (const [{ callSessionId, knockerSessionId }] of events) {
      if (callSessionId !== input || knockerSessionId !== callerSessionId) continue;
      yield undefined;
    }
  }),
});
