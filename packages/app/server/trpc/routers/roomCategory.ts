import type { RoomCategoryInMessage } from "@esposter/db-schema";

import { createRoomCategoryInputSchema } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import { deleteRoomCategoryInputSchema } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import { updateRoomCategoryInputSchema } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, roomCategoriesInMessage } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const roomCategoryRouter = router({
  createRoomCategory: standardAuthedProcedure
    .input(createRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input }) => {
      const createdRoomCategory = (
        await ctx.db
          .insert(roomCategoriesInMessage)
          .values({ ...input, userId: ctx.getSessionPayload.user.id })
          .returning()
      )[0];
      if (!createdRoomCategory)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.RoomCategory, JSON.stringify(input))
            .message,
        });
      return createdRoomCategory;
    }),
  deleteRoomCategory: standardAuthedProcedure
    .input(deleteRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input }) => {
      const deletedRoomCategory = (
        await ctx.db
          .delete(roomCategoriesInMessage)
          .where(
            and(eq(roomCategoriesInMessage.id, input), eq(roomCategoriesInMessage.userId, ctx.getSessionPayload.user.id)),
          )
          .returning()
      )[0];
      if (!deletedRoomCategory)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomCategory, input).message,
        });
      return deletedRoomCategory;
    }),
  readRoomCategories: standardAuthedProcedure.query<RoomCategoryInMessage[]>(({ ctx }) =>
    ctx.db.query.roomCategoriesInMessage.findMany({
      orderBy: { position: "asc", name: "asc" },
      where: { userId: { eq: ctx.getSessionPayload.user.id } },
    }),
  ),
  updateRoomCategory: standardAuthedProcedure
    .input(updateRoomCategoryInputSchema)
    .mutation<RoomCategoryInMessage>(async ({ ctx, input: { id, ...rest } }) => {
      const updatedRoomCategory = (
        await ctx.db
          .update(roomCategoriesInMessage)
          .set(rest)
          .where(
            and(eq(roomCategoriesInMessage.id, id), eq(roomCategoriesInMessage.userId, ctx.getSessionPayload.user.id)),
          )
          .returning()
      )[0];
      if (!updatedRoomCategory)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomCategory, id).message,
        });
      return updatedRoomCategory;
    }),
});
