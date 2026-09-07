import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { createRoomCategoryInputSchema } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import { deleteRoomCategoryInputSchema } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import { reorderRoomCategoriesInputSchema } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import { updateRoomCategoryInputSchema } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, roomCategoriesInMessage } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { eq, max } from "drizzle-orm";

// Every mutation here addresses one of the caller's own categories, so a miss is always the same rejection
const requireRoomCategory = (
  roomCategory: RoomCategoryInMessage | undefined,
  operation: Operation,
  context: string,
  code?: "BAD_REQUEST" | "NOT_FOUND",
) => requireMutation(roomCategory, operation, DatabaseEntityType.RoomCategory, context, code);

export const categoryRouter = router({
  createRoomCategory: standardAuthedProcedure
    .input(createRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input }) => {
      // Append below the user's existing drag-assigned order — the column default 0 would tie with
      // Whatever category the user dragged to the top and jump the new category above it
      const { maxPosition } = takeOne(
        await ctx.db
          .select({ maxPosition: max(roomCategoriesInMessage.position) })
          .from(roomCategoriesInMessage)
          .where(eq(roomCategoriesInMessage.userId, ctx.getSessionPayload.user.id)),
      );
      return requireRoomCategory(
        (
          await ctx.db
            .insert(roomCategoriesInMessage)
            .values({ ...input, position: (maxPosition ?? -1) + 1, userId: ctx.getSessionPayload.user.id })
            .returning()
        )[0],
        Operation.Create,
        JSON.stringify(input),
      );
    }),
  deleteRoomCategory: standardAuthedProcedure
    .input(deleteRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input }) =>
      requireRoomCategory(
        (
          await ctx.db
            .delete(roomCategoriesInMessage)
            .where(ownedBy(roomCategoriesInMessage, input, ctx.getSessionPayload.user.id))
            .returning()
        )[0],
        Operation.Delete,
        input,
        "NOT_FOUND",
      ),
    ),
  readRoomCategories: standardAuthedProcedure.query<RoomCategoryInMessage[]>(({ ctx }) =>
    ctx.db.query.roomCategoriesInMessage.findMany({
      // Drag-reorder assigns positions, so position must take precedence over the name tiebreaker
      // eslint-disable-next-line perfectionist/sort-objects
      orderBy: { position: "asc", name: "asc" },
      where: { userId: { eq: ctx.getSessionPayload.user.id } },
    }),
  ),
  reorderRoomCategories: standardAuthedProcedure
    .input(reorderRoomCategoriesInputSchema)
    .mutation<RoomCategoryInMessage[]>(({ ctx, input }) =>
      // One transaction so a drag either fully lands or fully rolls back — no partially-reordered state
      ctx.db.transaction(async (tx) => {
        const reorderedRoomCategories: RoomCategoryInMessage[] = [];
        for (const { id, position } of input)
          reorderedRoomCategories.push(
            requireRoomCategory(
              (
                await tx
                  .update(roomCategoriesInMessage)
                  .set({ position })
                  .where(ownedBy(roomCategoriesInMessage, id, ctx.getSessionPayload.user.id))
                  .returning()
              )[0],
              Operation.Update,
              id,
              "NOT_FOUND",
            ),
          );
        return reorderedRoomCategories;
      }),
    ),
  updateRoomCategory: standardAuthedProcedure
    .input(updateRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input: { id, ...rest } }) =>
      requireRoomCategory(
        (
          await ctx.db
            .update(roomCategoriesInMessage)
            .set(rest)
            .where(ownedBy(roomCategoriesInMessage, id, ctx.getSessionPayload.user.id))
            .returning()
        )[0],
        Operation.Update,
        id,
        "NOT_FOUND",
      ),
    ),
});
