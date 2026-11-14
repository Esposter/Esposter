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
    .meta({ staticReason: "The call object pushes the admission to its sockets as a typed event" })
    .mutation<void>(async ({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      await requireCallDoorkeeper(ctx, callSessionId, "admit");
      await getCallObject(callSessionId).admitKnocker({ callSessionId, knockerSessionId });
    }),
  dismissKnocker: standardAuthedProcedure
    .input(knockerInputSchema)
    .meta({ staticReason: "The call object pushes the dismissal to its sockets as a typed event" })
    .mutation<void>(async ({ ctx, input: { callSessionId, sessionId: knockerSessionId } }) => {
      await requireCallDoorkeeper(ctx, callSessionId, "dismiss");
      await getCallObject(callSessionId).dismissKnocker({ callSessionId, knockerSessionId });
    }),
  knockCall: standardAuthedProcedure
    .input(callSessionInputSchema)
    .meta({ staticReason: "The call object pushes the knock to the doorkeeper's sockets as a typed event" })
    .mutation<void>(async ({ ctx, input: { id } }) => {
      const callSession = await requireCallSession(ctx.db, id);
      if (callSession.roomId) throw getForbiddenError("Room calls cannot be knocked — join via joinCallByRoomId");

      const { session, user } = ctx;
      await getCallObject(id).knockCall({
        callSessionId: id,
        doorkeeperUserId: callSession.userId,
        knocker: createParticipant(session, user),
      });
    }),
});
