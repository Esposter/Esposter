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
import { Operation } from "@esposter/shared";

export const categoryRouter = router({
  createRoomCategory: standardAuthedProcedure
    .input(createRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input }) => {
      const createdRoomCategory = requireMutation(
        (
          await ctx.db
            .insert(roomCategoriesInMessage)
            .values({ ...input, userId: ctx.getSessionPayload.user.id })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.RoomCategory,
        JSON.stringify(input),
      );
      return createdRoomCategory;
    }),
  deleteRoomCategory: standardAuthedProcedure
    .input(deleteRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input }) => {
      const deletedRoomCategory = requireMutation(
        (
          await ctx.db
            .delete(roomCategoriesInMessage)
            .where(ownedBy(roomCategoriesInMessage, input, ctx.getSessionPayload.user.id))
            .returning()
        )[0],
        Operation.Delete,
        DatabaseEntityType.RoomCategory,
        input,
        "NOT_FOUND",
      );
      return deletedRoomCategory;
    }),
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
            requireMutation(
              (
                await tx
                  .update(roomCategoriesInMessage)
                  .set({ position })
                  .where(ownedBy(roomCategoriesInMessage, id, ctx.getSessionPayload.user.id))
                  .returning()
              )[0],
              Operation.Update,
              DatabaseEntityType.RoomCategory,
              id,
              "NOT_FOUND",
            ),
          );
        return reorderedRoomCategories;
      }),
    ),
  updateRoomCategory: standardAuthedProcedure
    .input(updateRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input: { id, ...rest } }) => {
      const updatedRoomCategory = requireMutation(
        (
          await ctx.db
            .update(roomCategoriesInMessage)
            .set(rest)
            .where(ownedBy(roomCategoriesInMessage, id, ctx.getSessionPayload.user.id))
            .returning()
        )[0],
        Operation.Update,
        DatabaseEntityType.RoomCategory,
        id,
        "NOT_FOUND",
      );
      return updatedRoomCategory;
    }),
});
