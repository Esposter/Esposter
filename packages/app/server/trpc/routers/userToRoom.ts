import type { UserToRoomInMessage } from "@esposter/db-schema";

import { updateUserToRoomInputSchema } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import { on } from "@@/server/services/events/on";
import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { updateUserToRoom } from "@@/server/services/message/updateUserToRoom";
import { router } from "@@/server/trpc";
import { assertIsMember } from "@@/server/trpc/middleware/userToRoom/assertIsMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { roomIdSchema, roomIdsSchema, userIdsSchema, usersToRoomsInMessage } from "@esposter/db-schema";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";

const readNicknamesInputSchema = z.object({
  ...roomIdSchema.shape,
  userIds: userIdsSchema.shape.userIds.min(1),
});

const readMyUsersToRoomsInputSchema = z.object({
  roomIds: roomIdsSchema.shape.roomIds.min(1),
});

const onUpdateUserToRoomInputSchema = roomIdsSchema.shape.roomIds.min(1);

export const userToRoomRouter = router({
  // Resets the caller's own mention badge on room view; idempotent — only emits when a count was cleared.
  clearMentionCount: getMemberProcedure(roomIdSchema, "roomId").mutation<void>(async ({ ctx, input }) => {
    const updatedUserToRoom = (
      await ctx.db
        .update(usersToRoomsInMessage)
        .set({ mentionCount: 0 })
        .where(
          and(
            eq(usersToRoomsInMessage.userId, ctx.getSessionPayload.user.id),
            eq(usersToRoomsInMessage.roomId, input.roomId),
            ne(usersToRoomsInMessage.mentionCount, 0),
          ),
        )
        .returning()
    )[0];
    if (updatedUserToRoom) userToRoomEventEmitter.emit("updateUserToRoom", updatedUserToRoom);
  }),
  onUpdateUserToRoom: standardAuthedProcedure.input(onUpdateUserToRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await assertIsMember(ctx.db, ctx.getSessionPayload, input);
    for await (const [data] of on(userToRoomEventEmitter, "updateUserToRoom", { signal })) {
      if (!input.includes(data.roomId) || data.userId !== ctx.getSessionPayload.user.id) continue;
      yield data;
    }
  }),
  readMyUsersToRooms: standardAuthedProcedure
    .input(readMyUsersToRoomsInputSchema)
    .query<UserToRoomInMessage[]>(async ({ ctx, input }) => {
      await assertIsMember(ctx.db, ctx.getSessionPayload, input.roomIds);
      return ctx.db.query.usersToRoomsInMessage.findMany({
        where: { roomId: { in: input.roomIds }, userId: { eq: ctx.getSessionPayload.user.id } },
      });
    }),
  readNicknames: getMemberProcedure(readNicknamesInputSchema, "roomId").query<
    Pick<UserToRoomInMessage, "nickname" | "roomId" | "userId">[]
  >(({ ctx, input }) =>
    ctx.db.query.usersToRoomsInMessage.findMany({
      columns: { nickname: true, roomId: true, userId: true },
      where: { roomId: { eq: input.roomId }, userId: { in: input.userIds } },
    }),
  ),
  updateUserToRoom: getMemberProcedure(updateUserToRoomInputSchema, "roomId").mutation<UserToRoomInMessage>(
    ({ ctx, input }) => updateUserToRoom(ctx.db, ctx.getSessionPayload.user.id, input),
  ),
});
