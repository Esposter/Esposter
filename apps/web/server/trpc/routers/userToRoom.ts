import type { UserToRoomInMessage } from "@esposter/db-schema";

import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { router } from "#server/trpc";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { readMyUsersToRoomsInputSchema } from "#shared/models/db/userToRoom/ReadMyUsersToRoomsInput";
import { updateUserToRoomInputSchema } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import { roomIdSchema, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, ne } from "drizzle-orm";

export const userToRoomRouter = router({
  // Resets the caller's own mention badge on room view; idempotent — only emits when a count was cleared.
  clearMentionCount: getMemberProcedure(roomIdSchema, "roomId").mutation<void>(async ({ ctx, input }) => {
    const updatedUserToRoom = (
      await ctx.db
        .update(usersToRoomsInMessage)
        .set({ mentionCount: 0 })
        .where(
          and(
            getRoomMembershipWhere(input.roomId, ctx.getSessionPayload.user.id),
            ne(usersToRoomsInMessage.mentionCount, 0),
          ),
        )
        .returning()
    )[0];
    if (updatedUserToRoom)
      await callUserObjects([updatedUserToRoom.userId], (userObject) => userObject.updateUserToRoom(updatedUserToRoom));
  }),
  readMyUsersToRooms: standardAuthedProcedure
    .input(readMyUsersToRoomsInputSchema)
    .query<UserToRoomInMessage[]>(async ({ ctx, input }) => {
      await assertIsMember(ctx.db, ctx.getSessionPayload, input.roomIds);
      return ctx.db.query.usersToRoomsInMessage.findMany({
        where: { roomId: { in: input.roomIds }, userId: { eq: ctx.getSessionPayload.user.id } },
      });
    }),
  updateUserToRoom: getMemberProcedure(updateUserToRoomInputSchema, "roomId").mutation<UserToRoomInMessage>(
    ({ ctx, input }) => updateUserToRoom(ctx.db, ctx.getSessionPayload.user.id, input),
  ),
});
