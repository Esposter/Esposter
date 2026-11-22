import type { RoomReaction } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { router } from "#server/trpc/index";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { reactionIdentityInputSchema } from "#shared/models/db/message/reaction/ReactionIdentityInput";
import { readReactionsInputSchema } from "#shared/models/db/message/reaction/ReadReactionsInput";
import { DatabaseEntityType } from "@esposter/db-schema";

// A reaction is held by its message's room, which decides each write and sends it to the room's viewers. The reactor is
// The caller, named by the session, so no input can add or remove someone else's reaction
export const emojiRouter = router({
  addReaction: getMemberProcedure(reactionIdentityInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes the reaction to its sockets as a typed event" })
    .mutation<RoomReaction>(({ ctx, input }) =>
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
  // The reaction as the room now holds it is the answer, with the caller off it, so a removal the last reactor made answers
  // The reaction with no reactor at the version the removal raised
  removeReaction: getMemberProcedure(reactionIdentityInputSchema, "roomId")
    .meta({ staticReason: "The room object pushes the reaction it now holds to its sockets as a typed event" })
    .mutation<RoomReaction>(({ ctx, input }) =>
      requireEntity(
        useRoomObject(input.roomId).removeReaction(
          { emojiTag: input.emojiTag, messageId: input.messageId },
          getRoomActor(ctx),
        ),
        DatabaseEntityType.Reaction,
        JSON.stringify(input),
      ),
    ),
});
