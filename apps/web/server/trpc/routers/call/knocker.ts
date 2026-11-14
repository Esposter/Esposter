import { createParticipant } from "#server/services/message/call/createParticipant";
import { getCallObject } from "#server/services/message/call/getCallObject";
import { requireCallDoorkeeper } from "#server/services/message/call/requireCallDoorkeeper";
import { requireCallSession } from "#server/services/message/call/requireCallSession";
import { router } from "#server/trpc";
import { getForbiddenError } from "#server/trpc/guards/getForbiddenError";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { callSessionInputSchema } from "#shared/models/db/call/CallSessionInput";
import { knockerInputSchema } from "#shared/models/db/call/KnockerInput";

export const knockerRouter = router({
  admitKnocker: standardAuthedProcedure
    .input(knockerInputSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      await requireCallDoorkeeper(ctx.db, ctx.getSessionPayload, callSessionId, "admit");
      await getCallObject(callSessionId).admitKnocker({ callSessionId, knockerSessionId });
    }),
  dismissKnocker: standardAuthedProcedure
    .input(knockerInputSchema)
    .mutation<void>(async ({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      await requireCallDoorkeeper(ctx.db, ctx.getSessionPayload, callSessionId, "dismiss");
      await getCallObject(callSessionId).dismissKnocker({ callSessionId, knockerSessionId });
    }),
  knockCall: standardAuthedProcedure.input(callSessionInputSchema).mutation<void>(async ({ ctx, input: { id } }) => {
    const callSession = await requireCallSession(ctx.db, id);
    if (callSession.roomId) throw getForbiddenError("Room calls cannot be knocked — join via joinCallByRoomId");

    const { session, user } = ctx.getSessionPayload;
    await getCallObject(id).knockCall({
      callSessionId: id,
      doorkeeperUserId: callSession.userId,
      knocker: createParticipant(session, user),
    });
  }),
});
