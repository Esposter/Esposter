import type { UserToRoomInMessage } from "@esposter/db-schema";

import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { router } from "#server/trpc/index";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { readMyUsersToRoomsInputSchema } from "#shared/models/db/userToRoom/ReadMyUsersToRoomsInput";
import { updateUserToRoomInputSchema } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import { inJsonArray } from "@esposter/db";
import { roomIdSchema, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, ne } from "drizzle-orm";

export const userToRoomRouter = router({
  // Resets the caller's own mention badge on room view; idempotent — only emits when a count was cleared.
  clearMentionCount: getMemberProcedure(roomIdSchema, "roomId").mutation<void>(async ({ ctx, input }) => {
    const updatedUserToRoom = (
      await ctx.db
        .update(usersToRoomsInMessage)
        .set({ mentionCount: 0 })
        .where(and(getRoomMembershipWhere(input.roomId, ctx.user.id), ne(usersToRoomsInMessage.mentionCount, 0)))
        .returning()
    )[0];
    if (updatedUserToRoom)
      await callUserObjects([updatedUserToRoom.userId], (userObject) => userObject.updateUserToRoom(updatedUserToRoom));
  }),
  // The caller's membership rows are the state of their room list
  readMyUsersToRooms: standardAuthedProcedure
    .input(readMyUsersToRoomsInputSchema)
    .query<UserToRoomInMessage[]>(async ({ ctx, input }) => {
      await assertIsMember(ctx, input.roomIds);
      return ctx.db
        .select()
        .from(usersToRoomsInMessage)
        .where(
          and(eq(usersToRoomsInMessage.userId, ctx.user.id), inJsonArray(usersToRoomsInMessage.roomId, input.roomIds)),
        );
    }),
  // A save writes the membership row of the target when one is named, else the caller's, and the row names its room
  updateUserToRoom: getMemberProcedure(updateUserToRoomInputSchema, "roomId").mutation<UserToRoomInMessage>(
    ({ ctx, input }) => updateUserToRoom(ctx.db, ctx.user.id, input),
  ),
});
