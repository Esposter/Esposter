import type { ScheduledRoomMessage } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { WordFilteredError } from "#server/models/message/moderation/WordFilteredError";
import { createUserMessage } from "#server/services/message/createUserMessage";
import { assertCanCreateMessage } from "#server/services/message/moderation/assertCanCreateMessage";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { router } from "#server/trpc/index";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { createScheduledMessageInputSchema } from "#shared/models/db/message/scheduledMessage/CreateScheduledMessageInput";
import { scheduledMessageIdentityInputSchema } from "#shared/models/db/message/scheduledMessage/ScheduledMessageIdentityInput";
import { updateScheduledMessageInputSchema } from "#shared/models/db/message/scheduledMessage/UpdateScheduledMessageInput";
import { DatabaseEntityType, MessageType } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";

// A scheduled message is held by its room's object, which sends it when it comes due and applies the sender's rules
// Then. The id is the object's key for it, minted here
export const scheduledMessageRouter = router({
  createScheduledMessage: getMemberProcedure(
    createScheduledMessageInputSchema,
    "roomId",
  ).mutation<ScheduledRoomMessage>(async ({ ctx, input }) => {
    await assertCanCreateMessage(ctx.db, ctx.user.id, input.roomId, input.message);
    return useRoomObject(input.roomId).createScheduledMessage(
      { id: v7(), message: input.message, replyToId: input.replyToId ?? undefined, runAt: input.runAt },
      getRoomActor(ctx),
    );
  }),
  deleteScheduledMessage: getMemberProcedure(scheduledMessageIdentityInputSchema, "roomId").mutation<void>(
    async ({ ctx, input }) => {
      const deletedScheduledMessage = await useRoomObject(input.roomId).deleteScheduledMessage(
        input.id,
        getRoomActor(ctx),
      );
      if (!deletedScheduledMessage) throw getNotFoundError(DatabaseEntityType.ScheduledMessageJob, input.id);
    },
  ),
  // The claim is the object's tombstone, so a message the object is already sending cannot be sent a second time.
  // Every guard createUserMessage would reject runs before the claim.
  // A claim the guards then refuse would burn the scheduled message without ever sending it.
  sendScheduledMessageNow: getMemberProcedure(
    scheduledMessageIdentityInputSchema,
    "roomId",
  ).mutation<ScheduledRoomMessage>(async ({ ctx, input }) => {
    const actor = getRoomActor(ctx);
    const roomObject = useRoomObject(input.roomId);
    const [scheduledMessage] = await roomObject.readScheduledMessages({ ids: [input.id], userId: actor.userId });
    if (!scheduledMessage) throw getNotFoundError(DatabaseEntityType.ScheduledMessageJob, input.id);

    // The word filter is the exception: it already applied the room's automod action, and its inputs are both stored.
    // Leaving the message scheduled hands the object the same block when it comes due.
    // That would be a second timeout and a second audit row for one message, so it is claimed here instead.
    await getResultAsync(() =>
      assertCanCreateMessage(ctx.db, actor.userId, input.roomId, scheduledMessage.message),
    ).match(noop, async (error) => {
      if (error instanceof TRPCError && error.cause instanceof WordFilteredError)
        await roomObject.deleteScheduledMessage(input.id, actor);
      throw error;
    });

    // The claim is answered with the tombstone it left, which the client confirms its entry at
    const claimedScheduledMessage = await roomObject.deleteScheduledMessage(input.id, actor);
    if (!claimedScheduledMessage) throw getNotFoundError(DatabaseEntityType.ScheduledMessageJob, input.id);

    // A send that fails past the guards, a transient write or a serialization error, must not burn the message.
    // Putting it back leaves it scheduled, so the caller's error means "not sent", never "lost".
    // The word filter can still block the send, and that one is never put back, for the same reason as above.
    return getResultAsync(() =>
      createUserMessage(ctx.db, actor, {
        files: [],
        message: scheduledMessage.message,
        replyToId: scheduledMessage.replyToId,
        roomId: input.roomId,
        type: MessageType.Message,
      }),
    ).match(
      () => claimedScheduledMessage,
      async (error) => {
        if (error instanceof TRPCError && error.cause instanceof WordFilteredError) throw error;
        // A put-back that fails too is logged.
        // The caller still hears why the send failed, not why the put-back did.
        await getResultAsync(() =>
          roomObject.createScheduledMessage(
            {
              id: scheduledMessage.id,
              message: scheduledMessage.message,
              replyToId: scheduledMessage.replyToId ?? undefined,
              runAt: scheduledMessage.runAt,
            },
            actor,
          ),
        ).match(noop, (putBackError) => {
          console.error("Scheduled message failed to be put back", { error: putBackError, id: scheduledMessage.id });
        });
        throw error;
      },
    );
  }),
  updateScheduledMessage: getMemberProcedure(
    updateScheduledMessageInputSchema,
    "roomId",
  ).mutation<ScheduledRoomMessage>(async ({ ctx, input }) => {
    await assertCanCreateMessage(ctx.db, ctx.user.id, input.roomId, input.message);
    return requireEntity(
      useRoomObject(input.roomId).updateScheduledMessage(
        { id: input.id, message: input.message, replyToId: input.replyToId ?? undefined, runAt: input.runAt },
        getRoomActor(ctx),
      ),
      DatabaseEntityType.ScheduledMessageJob,
      input.id,
    );
  }),
});
