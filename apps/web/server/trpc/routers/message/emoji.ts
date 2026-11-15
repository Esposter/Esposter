import type { RoomReaction } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { router } from "#server/trpc/index";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { addReactionInputSchema } from "#shared/models/db/message/reaction/AddReactionInput";
import { readReactionsInputSchema } from "#shared/models/db/message/reaction/ReadReactionsInput";
import { removeReactionInputSchema } from "#shared/models/db/message/reaction/RemoveReactionInput";
import { DatabaseEntityType } from "@esposter/db-schema";

// A reaction is held by its message's room, which decides each write and sends it to the room's viewers. The reactor is
// The caller, named by the session, so no input can add or remove someone else's reaction
export const emojiRouter = router({
  addReaction: getMemberProcedure(addReactionInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes the reaction to its sockets as a typed event" })
    .mutation<RoomReaction>(async ({ ctx, input }) =>
      requireEntity(
        useRoomObject(input.roomId).addReaction(
          { emojiTag: input.emojiTag, messageId: input.messageId },
          getRoomActor(ctx),
        ),
        DatabaseEntityType.Message,
        JSON.stringify(input),
      ),
    ),
  readReactions: getMemberProcedure(readReactionsInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes reaction changes to its sockets as typed events" })
    .query<RoomReaction[]>(({ input: { messageIds, roomId } }) => useRoomObject(roomId).readReactions(messageIds)),
  removeReaction: getMemberProcedure(removeReactionInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes the removed reaction to its sockets as a typed event" })
    .mutation<void>(async ({ ctx, input }) => {
      const isRemoved = await useRoomObject(input.roomId).removeReaction(
        { emojiTag: input.emojiTag, messageId: input.messageId },
        getRoomActor(ctx),
      );
      if (!isRemoved) throw getNotFoundError(DatabaseEntityType.Reaction, JSON.stringify(input));
    }),
});
