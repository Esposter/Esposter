import { updateUserToRoomInputSchema } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { DatabaseEntityType, selectRoomSchema, usersToRooms } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const readUserToRoomsInputSchema = z.object({ roomIds: selectRoomSchema.shape.id.array().min(1) });
export type ReadUserToRoomsInput = z.infer<typeof readUserToRoomsInputSchema>;

export const userToRoomRouter = router({
  readUserToRooms: standardAuthedProcedure.input(readUserToRoomsInputSchema).query(async ({ ctx, input }) => {
    await isMember(ctx.db, ctx.session, input.roomIds);
    return ctx.db.query.usersToRooms.findMany({
      columns: { notificationType: true, roomId: true, userId: true },
      where: (usersToRooms, { and, eq, inArray }) =>
        and(eq(usersToRooms.userId, ctx.session.user.id), inArray(usersToRooms.roomId, input.roomIds)),
    });
  }),
  updateUserToRoom: getMemberProcedure(updateUserToRoomInputSchema, "roomId").mutation(
    async ({ ctx, input: { notificationType, roomId } }) => {
      const updatedUserToRoom = (
        await ctx.db
          .update(usersToRooms)
          .set({ notificationType })
          .where(and(eq(usersToRooms.roomId, roomId), eq(usersToRooms.userId, ctx.session.user.id)))
          .returning()
      )[0];
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
