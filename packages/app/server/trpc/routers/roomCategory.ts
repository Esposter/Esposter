import type { RoomCategory } from "@esposter/db-schema";

import { createRoomCategoryInputSchema } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import { deleteRoomCategoryInputSchema } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import { updateRoomCategoryInputSchema } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, roomCategories } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const roomCategoryRouter = router({
  createRoomCategory: standardAuthedProcedure
    .input(createRoomCategoryInputSchema)
    .mutation<RoomCategory>(async ({ ctx, input }) => {
      const createdRoomCategory = (
        await ctx.db
          .insert(roomCategories)
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
    .mutation<RoomCategory>(async ({ ctx, input }) => {
      const deletedRoomCategory = (
        await ctx.db
          .delete(roomCategories)
          .where(and(eq(roomCategories.id, input), eq(roomCategories.userId, ctx.getSessionPayload.user.id)))
          .returning()
      )[0];
      if (!deletedRoomCategory)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomCategory, input).message,
        });
      return deletedRoomCategory;
    }),
  readRoomCategories: standardAuthedProcedure.query<RoomCategory[]>(({ ctx }) =>
    ctx.db.query.roomCategories.findMany({
      orderBy: (roomCategories, { asc }) => [asc(roomCategories.position), asc(roomCategories.name)],
      where: (roomCategories, { eq }) => eq(roomCategories.userId, ctx.getSessionPayload.user.id),
    }),
  ),
  updateRoomCategory: standardAuthedProcedure
    .input(updateRoomCategoryInputSchema)
    .mutation<RoomCategory>(async ({ ctx, input: { id, ...rest } }) => {
      const updatedRoomCategory = (
        await ctx.db
          .update(roomCategories)
          .set(rest)
          .where(and(eq(roomCategories.id, id), eq(roomCategories.userId, ctx.getSessionPayload.user.id)))
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
