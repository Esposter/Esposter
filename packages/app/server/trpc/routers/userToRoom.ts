import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { DatabaseEntityType, NotificationType, selectRoomSchema, usersToRooms } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const readUserToRoomInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type ReadUserToRoomInput = z.infer<typeof readUserToRoomInputSchema>;

const updateUserToRoomInputSchema = z.object({
  notificationType: z.enum(NotificationType),
  roomId: selectRoomSchema.shape.id,
});
export type UpdateUserToRoomInput = z.infer<typeof updateUserToRoomInputSchema>;

export const userToRoomRouter = router({
  readUserToRoom: getMemberProcedure(readUserToRoomInputSchema, "roomId").query(async ({ ctx, input }) => {
    const readUserToRoom = await ctx.db.query.usersToRooms.findFirst({
      columns: { notificationType: true, roomId: true, userId: true },
      where: (usersToRooms, { and, eq }) =>
        and(eq(usersToRooms.roomId, input.roomId), eq(usersToRooms.userId, ctx.session.user.id)),
    });
    if (!readUserToRoom)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: new InvalidOperationError(
          Operation.Read,
          DatabaseEntityType.UserToRoom,
          JSON.stringify({ roomId: input.roomId, userId: ctx.session.user.id }),
        ).message,
      });
    return readUserToRoom;
  }),
  updateUserToRoom: getMemberProcedure(updateUserToRoomInputSchema, "roomId").mutation(
    async ({ ctx, input: { notificationType, roomId } }) => {
      const updatedUserToRoom = (
        await ctx.db
          .update(usersToRooms)
          .set({ notificationType })
          .where(and(eq(usersToRooms.roomId, roomId), eq(usersToRooms.userId, ctx.session.user.id)))
          .returning()
      ).find(Boolean);
      if (!updatedUserToRoom)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Update,
            DatabaseEntityType.UserToRoom,
            JSON.stringify({ roomId }),
          ).message,
        });
      return updatedUserToRoom;
    },
  ),
});
