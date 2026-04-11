import type { RoomCategory } from "@esposter/db-schema";

import { createRoomCategoryInputSchema } from "#shared/models/db/roomCategory/CreateRoomCategoryInput";
import { deleteRoomCategoryInputSchema } from "#shared/models/db/roomCategory/DeleteRoomCategoryInput";
import { updateRoomCategoryInputSchema } from "#shared/models/db/roomCategory/UpdateRoomCategoryInput";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, roomCategories } from "@esposter/db-schema";
import { InvalidOperationError, NotFoundError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";

export const roomCategoryRouter = router({
  createRoomCategory: standardAuthedProcedure
    .input(createRoomCategoryInputSchema)
    .mutation<RoomCategory>(async ({ ctx, input }) => {
      const userId = ctx.getSessionPayload.user.id;
      const created = (
        await ctx.db
          .insert(roomCategories)
          .values({ ...input, userId })
          .returning()
      )[0];
      if (!created)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.RoomCategory, JSON.stringify(input))
            .message,
        });
      return created;
    }),
  deleteRoomCategory: standardAuthedProcedure
    .input(deleteRoomCategoryInputSchema)
    .mutation<RoomCategory>(async ({ ctx, input }) => {
      const userId = ctx.getSessionPayload.user.id;
      const deleted = (
        await ctx.db
          .delete(roomCategories)
          .where(and(eq(roomCategories.id, input), eq(roomCategories.userId, userId)))
          .returning()
      )[0];
      if (!deleted)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomCategory, input).message,
        });
      return deleted;
    }),
  readRoomCategories: standardAuthedProcedure.query<RoomCategory[]>(({ ctx }) =>
    ctx.db
      .select()
      .from(roomCategories)
      .where(eq(roomCategories.userId, ctx.getSessionPayload.user.id))
      .orderBy(asc(roomCategories.position), asc(roomCategories.name)),
  ),
  updateRoomCategory: standardAuthedProcedure
    .input(updateRoomCategoryInputSchema)
    .mutation<RoomCategory>(async ({ ctx, input: { id, ...rest } }) => {
      const userId = ctx.getSessionPayload.user.id;
      const updated = (
        await ctx.db
          .update(roomCategories)
          .set(rest)
          .where(and(eq(roomCategories.id, id), eq(roomCategories.userId, userId)))
          .returning()
      )[0];
      if (!updated)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: new NotFoundError(DatabaseEntityType.RoomCategory, id).message,
        });
      return updated;
    }),
});
