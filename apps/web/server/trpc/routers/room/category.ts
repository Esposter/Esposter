import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { createRoomCategoryInputSchema } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import { deleteRoomCategoryInputSchema } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import { reorderRoomCategoriesInputSchema } from "#shared/models/db/roomCategory/ReorderRoomCategoriesInput";
import { updateRoomCategoryInputSchema } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import { ownedBy } from "@@/server/services/db/ownedBy";
import { requireRoomCategory } from "@@/server/services/room/category/requireRoomCategory";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { roomCategoriesInMessage } from "@esposter/db-schema";
import { Operation, takeOne } from "@esposter/shared";
import { and, eq, inArray, max, sql } from "drizzle-orm";

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
      // eslint-disable-next-line perfectionist/sort-objects -- position decides and the name only breaks a tie
      orderBy: { position: "asc", name: "asc" },
      where: { userId: { eq: ctx.getSessionPayload.user.id } },
    }),
  ),
  reorderRoomCategories: standardAuthedProcedure
    .input(reorderRoomCategoriesInputSchema)
    .mutation<RoomCategoryInMessage[]>(({ ctx, input }) =>
      // One statement for the whole drag — each category takes its new position from the CASE — inside a transaction,
      // So a category the caller does not own rolls every other position back with it
      ctx.db.transaction(async (tx) => {
        const positionCase = sql`case ${sql.join(
          input.map(({ id, position }) => sql`when ${roomCategoriesInMessage.id} = ${id} then ${position}::integer`),
          sql` `,
        )} end`;
        const updatedRoomCategories = await tx
          .update(roomCategoriesInMessage)
          .set({ position: positionCase })
          .where(
            and(
              inArray(
                roomCategoriesInMessage.id,
                input.map(({ id }) => id),
              ),
              eq(roomCategoriesInMessage.userId, ctx.getSessionPayload.user.id),
            ),
          )
          .returning();
        const idRoomCategoryMap = new Map(updatedRoomCategories.map((roomCategory) => [roomCategory.id, roomCategory]));
        return input.map(({ id }) => requireRoomCategory(idRoomCategoryMap.get(id), Operation.Update, id, "NOT_FOUND"));
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
