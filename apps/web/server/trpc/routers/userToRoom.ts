import type { UserToRoomInMessage } from "@esposter/db-schema";

import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { getProcedureTopics } from "#server/services/realtime/getProcedureTopics";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { router } from "#server/trpc";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { readMyUsersToRoomsInputSchema } from "#shared/models/db/userToRoom/ReadMyUsersToRoomsInput";
import { updateUserToRoomInputSchema } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import { getTopic } from "#shared/services/realtime/getTopic";
import { roomIdSchema, TopicKind, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, ne } from "drizzle-orm";

// The caller's membership rows are the state of their room list, so a change to one is a change to that list
const roomListTopics = ({ userId }: { userId?: string }) =>
  userId === undefined ? [] : [getTopic(TopicKind.RoomList, userId)];

export const userToRoomRouter = router({
  // Resets the caller's own mention badge on room view; idempotent — only emits when a count was cleared.
  clearMentionCount: getMemberProcedure(roomIdSchema, "roomId")
    .meta({ topics: roomListTopics })
    .mutation<void>(async ({ ctx, input }) => {
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
        await callUserObjects([updatedUserToRoom.userId], (userObject) =>
          userObject.updateUserToRoom(updatedUserToRoom),
        );
    }),
  readMyUsersToRooms: standardAuthedProcedure
    .input(readMyUsersToRoomsInputSchema)
    .meta({ topics: roomListTopics })
    .query<UserToRoomInMessage[]>(async ({ ctx, input }) => {
      await assertIsMember(ctx.db, ctx.getSessionPayload, input.roomIds);
      return ctx.db.query.usersToRoomsInMessage.findMany({
        where: { roomId: { in: input.roomIds }, userId: { eq: ctx.getSessionPayload.user.id } },
      });
    }),
  updateUserToRoom: getMemberProcedure(updateUserToRoomInputSchema, "roomId")
    .meta({
      topics: getProcedureTopics(updateUserToRoomInputSchema, (input, { userId }) => {
        // A display name is what the member list shows, so only a rename reaches the room's readers. The row changed
        // Belongs to the target when one is named, and to the caller otherwise
        const affectedUserId = input.targetUserId ?? userId;
        return [
          ...(input.displayName === undefined ? [] : [getTopic(TopicKind.Room, input.roomId)]),
          ...(affectedUserId === undefined ? [] : [getTopic(TopicKind.RoomList, affectedUserId)]),
        ];
      }),
    })
    .mutation<UserToRoomInMessage>(({ ctx, input }) => updateUserToRoom(ctx.db, ctx.getSessionPayload.user.id, input)),
});
