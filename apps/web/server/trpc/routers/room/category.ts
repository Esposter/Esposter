import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { getInsertSelectMetadata } from "#server/services/db/getInsertSelectMetadata";
import { ownedBy } from "#server/services/db/ownedBy";
import { requireRoomCategory } from "#server/services/room/category/requireRoomCategory";
import { router } from "#server/trpc/index";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { createRoomCategoryInputSchema } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import { deleteRoomCategoryInputSchema } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import { reorderRoomCategoriesInputSchema } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import { getLiveRowWhere, roomCategoriesInMessage, usersInAuth, usersToRoomsInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq, isNotNull, sql } from "drizzle-orm";

export const categoryRouter = router({
  createRoomCategory: standardAuthedProcedure
    .input(createRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // Append below the user's existing drag-assigned order — the column default 0 would tie with
      // Whatever category the user dragged to the top and jump the new category above it. The position is read inside
      // The insert statement, so two creates that run at once each read the maximum the other has not yet written
      return requireRoomCategory(
        (
          await ctx.db
            .insert(roomCategoriesInMessage)
            .select(
              ctx.db
                .select({
                  ...getInsertSelectMetadata(roomCategoriesInMessage),
                  id: sql`${input.id}`.as("id"),
                  name: sql`${input.name}`.as("name"),
                  position:
                    sql`(select coalesce(max(${roomCategoriesInMessage.position}), -1) + 1 from ${roomCategoriesInMessage} where ${and(eq(roomCategoriesInMessage.userId, userId), getLiveRowWhere(roomCategoriesInMessage))})`.as(
                      "position",
                    ),
                  userId: sql`${userId}`.as("userId"),
                })
                .from(usersInAuth)
                .where(eq(usersInAuth.id, userId)),
            )
            // A category a deletion left as a tombstone is revived by a create that names its id.
            // Only its owner may revive it, so the set-where names the owner too.
            .onConflictDoUpdate({
              set: { deletedAt: null, name: sql`excluded.name`, position: sql`excluded.position` },
              setWhere: sql`${isNotNull(roomCategoriesInMessage.deletedAt)} and ${eq(roomCategoriesInMessage.userId, userId)}`,
              target: roomCategoriesInMessage.id,
            })
            .returning()
        )[0],
        Operation.Create,
        JSON.stringify(input),
      );
    }),
  // The removal keeps the category as a tombstone, and takes the caller's memberships off it.
  // That is what the foreign key's `set-null` did when the row was deleted.
  // Only the caller's own memberships are named, so a category of someone else is untouched.
  deleteRoomCategory: standardAuthedProcedure
    .input(deleteRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input }) => {
      const [, deletedRoomCategories] = await ctx.db.batch([
        ctx.db
          .update(usersToRoomsInMessage)
          .set({ categoryId: null })
          .where(and(eq(usersToRoomsInMessage.categoryId, input), eq(usersToRoomsInMessage.userId, ctx.user.id))),
        ctx.db
          .update(roomCategoriesInMessage)
          .set({ deletedAt: new Date() })
          .where(and(ownedBy(roomCategoriesInMessage, input, ctx.user.id), getLiveRowWhere(roomCategoriesInMessage)))
          .returning(),
      ]);
      return requireRoomCategory(deletedRoomCategories[0], Operation.Delete, input, "NOT_FOUND");
    }),
  // The read returns a deletion as a tombstone, so a category a client holds is removed by the row the read brings back
  readRoomCategories: standardAuthedProcedure.query<RoomCategoryInMessage[]>(({ ctx }) =>
    ctx.db.query.roomCategoriesInMessage.findMany({
      // Drag-reorder assigns positions, so position must take precedence over the name tiebreaker
      orderBy: (category, { asc }) => [asc(category.position), asc(category.name)],
      where: { userId: { eq: ctx.user.id } },
    }),
  ),
  reorderRoomCategories: standardAuthedProcedure
    .input(reorderRoomCategoriesInputSchema)
    .mutation<RoomCategoryInMessage[]>(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      // The whole drag is one JSON array bound twice, so the statement's parameters do not grow with the list: each
      // Category takes its position from the array row that names its id
      const reorderJson = JSON.stringify(input.map(({ id, position }) => ({ id, position })));
      const reorderedIds = sql`(select json_extract(value, '$.id') from json_each(${reorderJson}))`;
      // One statement for the whole drag.
      // It moves nothing unless every category named is the caller's live one.
      // A miss refuses the whole reorder rather than moving the ones it owns.
      const updatedRoomCategories = await ctx.db
        .update(roomCategoriesInMessage)
        .set({
          position: sql`(select json_extract(value, '$.position') from json_each(${reorderJson}) where json_extract(value, '$.id') = ${roomCategoriesInMessage.id})`,
        })
        .where(
          and(
            sql`${roomCategoriesInMessage.id} in ${reorderedIds}`,
            eq(roomCategoriesInMessage.userId, userId),
            getLiveRowWhere(roomCategoriesInMessage),
            sql`(select count(*) from ${roomCategoriesInMessage} where ${roomCategoriesInMessage.userId} = ${userId} and ${getLiveRowWhere(roomCategoriesInMessage)} and ${roomCategoriesInMessage.id} in ${reorderedIds}) = ${input.length}`,
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
                and(
                  eq(roomCategoriesInMessage.userId, userId),
                  getLiveRowWhere(roomCategoriesInMessage),
                  sql`${roomCategoriesInMessage.id} in ${reorderedIds}`,
                ),
              );
      const idRoomCategoryMap = new Map(reorderedRoomCategories.map((roomCategory) => [roomCategory.id, roomCategory]));
      return input.map(({ id }) => requireRoomCategory(idRoomCategoryMap.get(id), Operation.Update, id, "NOT_FOUND"));
    }),
});
