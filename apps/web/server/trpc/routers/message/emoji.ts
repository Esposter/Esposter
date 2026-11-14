import type { RoomReaction } from "@esposter/db-schema";

import { useRoomObject } from "#server/composables/realtime/useRoomObject";
import { getRoomActor } from "#server/services/realtime/getRoomActor";
import { router } from "#server/trpc";
import { getNotFoundError } from "#server/trpc/guards/getNotFoundError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { addReactionInputSchema } from "#shared/models/db/message/reaction/AddReactionInput";
import { readReactionsInputSchema } from "#shared/models/db/message/reaction/ReadReactionsInput";
import { removeReactionInputSchema } from "#shared/models/db/message/reaction/RemoveReactionInput";
import { DatabaseEntityType } from "@esposter/db-schema";

// A reaction is held by its message's room, which decides each write and sends it to the room's viewers. The reactor is
// the caller, named by the session, so no input can add or remove someone else's reaction
export const emojiRouter = router({
  addReaction: getMemberProcedure(addReactionInputSchema, "roomId").mutation<RoomReaction>(async ({ ctx, input }) =>
    requireEntity(
      useRoomObject(input.roomId).addReaction(
        { emojiTag: input.emojiTag, messageId: input.messageId },
        getRoomActor(ctx.getSessionPayload, ctx.headers),
      ),
      DatabaseEntityType.Message,
      JSON.stringify(input),
    ),
  ),
  removeReaction: getMemberProcedure(removeReactionInputSchema, "roomId").mutation<void>(async ({ ctx, input }) => {
    const isRemoved = await useRoomObject(input.roomId).removeReaction(
      { emojiTag: input.emojiTag, messageId: input.messageId },
      getRoomActor(ctx.getSessionPayload, ctx.headers),
    );
    if (!isRemoved) throw getNotFoundError(DatabaseEntityType.Reaction, JSON.stringify(input));
  }),
  readReactions: getMemberProcedure(readReactionsInputSchema, "roomId").query<RoomReaction[]>(
    ({ input: { messageIds, roomId } }) => useRoomObject(roomId).readReactions(messageIds),
  ),
});
