import type { RoomMessage, ScheduledRoomMessage } from "@esposter/db-schema";
import type { ScheduledMessageWithRoom } from "#shared/models/db/message/scheduledMessage/ScheduledMessageWithRoom";
import type { BasePaginationData } from "#shared/models/pagination/BasePaginationData";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { useUserObject } from "#server/composables/realtime/useUserObject";
import { createUserMessage } from "#server/services/message/createUserMessage";
import { assertCanCreateMessage } from "#server/services/message/moderation/assertCanCreateMessage";
import { readMyScheduledMessages } from "#server/services/message/scheduledMessage/readMyScheduledMessages";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { router } from "#server/trpc";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createScheduledMessageInputSchema } from "#shared/models/db/message/scheduledMessage/CreateScheduledMessageInput";
import { deleteScheduledMessageInputSchema } from "#shared/models/db/message/scheduledMessage/DeleteScheduledMessageInput";
import { readMyScheduledMessagesInputSchema } from "#shared/models/db/message/scheduledMessage/ReadMyScheduledMessagesInput";
import { readScheduledMessagesInputSchema } from "#shared/models/db/message/scheduledMessage/ReadScheduledMessagesInput";
import { sendScheduledMessageNowInputSchema } from "#shared/models/db/message/scheduledMessage/SendScheduledMessageNowInput";
import { updateScheduledMessageInputSchema } from "#shared/models/db/message/scheduledMessage/UpdateScheduledMessageInput";
import { DatabaseEntityType, MessageType } from "@esposter/db-schema";
import { getResultAsync, noop, WordFilteredError } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// A scheduled message is held by its room's object, which sends it when it comes due and applies the sender's rules
// then. The id is the object's key for it, minted here
export const scheduledMessageRouter = router({
  createScheduledMessage: getMemberProcedure(
    createScheduledMessageInputSchema,
    "roomId",
  ).mutation<ScheduledRoomMessage>(async ({ ctx, input }) => {
    await assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, input.roomId, input.message);
    return useRoomObject(input.roomId).createScheduledMessage(
      { id: crypto.randomUUID(), message: input.message, replyToId: input.replyToId ?? undefined, runAt: input.runAt },
      getRoomActor(ctx.getSessionPayload, ctx.headers),
    );
  }),
  deleteScheduledMessage: getMemberProcedure(deleteScheduledMessageInputSchema, "roomId").mutation<void>(
    async ({ ctx, input }) => {
      const isDeleted = await useRoomObject(input.roomId).deleteScheduledMessage(
        input.id,
        getRoomActor(ctx.getSessionPayload, ctx.headers),
      );
      if (!isDeleted) throw getNotFoundError(DatabaseEntityType.ScheduledMessageJob, input.id);
    },
  ),
  readMyScheduledMessages: standardAuthedProcedure
    .input(readMyScheduledMessagesInputSchema)
    .query<BasePaginationData<ScheduledMessageWithRoom>>(({ ctx, input }) =>
      readMyScheduledMessages(ctx.db, ctx.getSessionPayload.user.id, input),
    ),
  readMyScheduledMessagesCount: standardAuthedProcedure.query<number>(
    async ({ ctx }) => (await useUserObject(ctx.getSessionPayload.user.id).readScheduledMessages()).length,
  ),
  readScheduledMessages: getMemberProcedure(readScheduledMessagesInputSchema, "roomId").query<ScheduledRoomMessage[]>(
    ({ ctx, input }) => useRoomObject(input.roomId).readScheduledMessages(ctx.getSessionPayload.user.id),
  ),
  // The claim is the object's delete, so a message the object is already sending cannot be sent a second time from here.
  // Every guard createUserMessage would reject runs before the claim, because a claim the guards then refuse would burn
  // the scheduled message without ever sending it
  sendScheduledMessageNow: getMemberProcedure(sendScheduledMessageNowInputSchema, "roomId").mutation<RoomMessage>(
    async ({ ctx, input }) => {
      const actor = getRoomActor(ctx.getSessionPayload, ctx.headers);
      const roomObject = useRoomObject(input.roomId);
      const scheduledMessage = (await roomObject.readScheduledMessages(actor.userId)).find(({ id }) => id === input.id);
      if (!scheduledMessage) throw getNotFoundError(DatabaseEntityType.ScheduledMessageJob, input.id);

      // The word filter is the exception: it already applied the room's automod action, and its inputs are both stored, so
      // leaving the message scheduled hands the object the same block when it comes due — a second timeout and a second
      // audit row for one message. Claim it here instead, so it is burnt
      await getResultAsync(() =>
        assertCanCreateMessage(ctx.db, actor.userId, input.roomId, scheduledMessage.message),
      ).match(noop, async (error) => {
        if (error instanceof TRPCError && error.cause instanceof WordFilteredError)
          await roomObject.deleteScheduledMessage(input.id, actor);
        throw error;
      });

      const isClaimed = await roomObject.deleteScheduledMessage(input.id, actor);
      if (!isClaimed) throw getNotFoundError(DatabaseEntityType.ScheduledMessageJob, input.id);

      // A send that fails past the guards — a transient write, a serialization error — must not burn the message: putting
      // it back leaves it scheduled, so the caller's error means "not sent", never "lost". The word filter can still block
      // here, and that one is never put back, for the same reason as above
      return getResultAsync(() =>
        createUserMessage(ctx.db, actor, {
          files: [],
          message: scheduledMessage.message,
          replyToId: scheduledMessage.replyToId,
          roomId: input.roomId,
          type: MessageType.Message,
        }),
      ).match(
        (message) => message,
        async (error) => {
          if (error instanceof TRPCError && error.cause instanceof WordFilteredError) throw error;
          await roomObject.createScheduledMessage(
            {
              id: scheduledMessage.id,
              message: scheduledMessage.message,
              replyToId: scheduledMessage.replyToId ?? undefined,
              runAt: scheduledMessage.runAt,
            },
            actor,
          );
          throw error;
        },
      );
    },
  ),
  updateScheduledMessage: getMemberProcedure(
    updateScheduledMessageInputSchema,
    "roomId",
  ).mutation<ScheduledRoomMessage>(async ({ ctx, input }) => {
    await assertCanCreateMessage(ctx.db, ctx.getSessionPayload.user.id, input.roomId, input.message);
    return requireEntity(
      useRoomObject(input.roomId).updateScheduledMessage(
        { id: input.id, message: input.message, replyToId: input.replyToId ?? undefined, runAt: input.runAt },
        getRoomActor(ctx.getSessionPayload, ctx.headers),
      ),
      DatabaseEntityType.ScheduledMessageJob,
      input.id,
    );
  }),
});
