import type { UserToRoomInMessage } from "@esposter/db-schema";

import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { callUserObjects } from "#server/services/realtime/callUserObjects";
import { assertIsMember } from "#server/services/room/assertIsMember";
import { getRoomListTopics } from "#server/services/room/getRoomListTopics";
import { getRoomMembershipWhere } from "#server/services/room/getRoomMembershipWhere";
import { router } from "#server/trpc";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { readMyUsersToRoomsInputSchema } from "#shared/models/db/userToRoom/ReadMyUsersToRoomsInput";
import { updateUserToRoomInputSchema } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import { inJsonArray } from "@esposter/db";
import { getTopic, roomIdSchema, TopicKind, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, ne } from "drizzle-orm";

export const userToRoomRouter = router({
  // The caller's membership rows are the state of their room list, so a change to one is a change to that list
  // Resets the caller's own mention badge on room view; idempotent — only emits when a count was cleared.
  clearMentionCount: getTopicsProcedure(getMemberProcedure(roomIdSchema, "roomId"), ({ ctx }) =>
    getRoomListTopics(ctx.user.id),
  ).mutation<void>(async ({ ctx, input }) => {
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
  readMyUsersToRooms: getTopicsProcedure(standardAuthedProcedure.input(readMyUsersToRoomsInputSchema), ({ ctx }) =>
    getRoomListTopics(ctx.user.id),
  ).query<UserToRoomInMessage[]>(async ({ ctx, input }) => {
    await assertIsMember(ctx, input.roomIds);
    return ctx.db
      .select()
      .from(usersToRoomsInMessage)
      .where(
        and(eq(usersToRoomsInMessage.userId, ctx.user.id), inJsonArray(usersToRoomsInMessage.roomId, input.roomIds)),
      );
  }),
  updateUserToRoom: getTopicsProcedure(getMemberProcedure(updateUserToRoomInputSchema, "roomId"), ({ ctx, input }) => {
    // A display name is what the member list shows, so only a rename reaches the room's readers. The row changed
    // Belongs to the target when one is named, and to the caller otherwise
    const affectedUserId = input.targetUserId ?? ctx.user.id;
    return [
      ...(input.displayName === undefined ? [] : [getTopic(TopicKind.Room, input.roomId)]),
      ...getRoomListTopics(affectedUserId),
    ];
  }).mutation<UserToRoomInMessage>(({ ctx, input }) => updateUserToRoom(ctx.db, ctx.user.id, input)),
});
