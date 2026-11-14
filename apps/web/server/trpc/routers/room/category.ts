import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { ownedBy } from "#server/services/db/ownedBy";
import { requireRoomCategory } from "#server/services/room/category/requireRoomCategory";
import { router } from "#server/trpc";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createRoomCategoryInputSchema } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import { deleteRoomCategoryInputSchema } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import { reorderRoomCategoriesInputSchema } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import { updateRoomCategoryInputSchema } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import { roomCategoriesInMessage } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { and, eq, max, sql } from "drizzle-orm";

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
      orderBy: (category, { asc }) => [asc(category.position), asc(category.name)],
      where: { userId: { eq: ctx.getSessionPayload.user.id } },
    }),
  ),
  reorderRoomCategories: standardAuthedProcedure
    .input(reorderRoomCategoriesInputSchema)
    .mutation<RoomCategoryInMessage[]>(async ({ ctx, input }) => {
      const userId = ctx.getSessionPayload.user.id;
      // The whole drag is one JSON array bound twice, so the statement's parameters do not grow with the list: each
      // Category takes its position from the array row that names its id
      const reorderJson = JSON.stringify(input.map(({ id, position }) => ({ id, position })));
      const reorderedIds = sql`(select json_extract(value, '$.id') from json_each(${reorderJson}))`;
      // One statement for the whole drag. It moves nothing unless every category named is the caller's, so a miss
      // Refuses the whole reorder rather than moving the ones it owns
      const updatedRoomCategories = await ctx.db
        .update(roomCategoriesInMessage)
        .set({
          position: sql`(select json_extract(value, '$.position') from json_each(${reorderJson}) where json_extract(value, '$.id') = ${roomCategoriesInMessage.id})`,
        })
        .where(
          and(
            sql`${roomCategoriesInMessage.id} in ${reorderedIds}`,
            eq(roomCategoriesInMessage.userId, userId),
            sql`(select count(*) from ${roomCategoriesInMessage} where ${roomCategoriesInMessage.userId} = ${userId} and ${roomCategoriesInMessage.id} in ${reorderedIds}) = ${input.length}`,
          ),
        )
        .returning();
      // A refused drag moves nothing and returns nothing, so the category it names is the first one the caller does not
      // Own, which the read of the ids the caller does own finds
      const reorderedRoomCategories =
        updatedRoomCategories.length === input.length
          ? updatedRoomCategories
          : await ctx.db
              .select()
              .from(roomCategoriesInMessage)
              .where(
                and(eq(roomCategoriesInMessage.userId, userId), sql`${roomCategoriesInMessage.id} in ${reorderedIds}`),
              );
      const idRoomCategoryMap = new Map(reorderedRoomCategories.map((roomCategory) => [roomCategory.id, roomCategory]));
      return input.map(({ id }) => requireRoomCategory(idRoomCategoryMap.get(id), Operation.Update, id, "NOT_FOUND"));
    }),
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
