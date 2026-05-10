import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { createRoomCategoryInputSchema } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import { deleteRoomCategoryInputSchema } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import { updateRoomCategoryInputSchema } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import { router } from "@@/server/trpc";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, roomCategoriesInMessage } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { and, eq } from "drizzle-orm";

export const roomCategoryRouter = router({
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
            .where(
              and(
                eq(roomCategoriesInMessage.id, input),
                eq(roomCategoriesInMessage.userId, ctx.getSessionPayload.user.id),
              ),
            )
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
      orderBy: { name: "asc", position: "asc" },
      where: { userId: { eq: ctx.getSessionPayload.user.id } },
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
            .where(
              and(
                eq(roomCategoriesInMessage.id, id),
                eq(roomCategoriesInMessage.userId, ctx.getSessionPayload.user.id),
              ),
            )
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
