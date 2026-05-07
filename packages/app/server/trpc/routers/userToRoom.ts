import { updateUserToRoomInputSchema } from "#shared/models/db/userToRoom/UpdateUserToRoomInput";
import { MAX_READ_LIMIT } from "#shared/services/pagination/constants";
import { on } from "@@/server/services/events/on";
import { userToRoomEventEmitter } from "@@/server/services/message/events/userToRoomEventEmitter";
import { updateUserToRoom } from "@@/server/services/message/updateUserToRoom";
import { router } from "@@/server/trpc";
import { isMember } from "@@/server/trpc/middleware/userToRoom/isMember";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { selectRoomInMessageSchema } from "@esposter/db-schema";
import { z } from "zod";

const readNicknamesInputSchema = z.object({
  roomId: selectRoomInMessageSchema.shape.id,
  userIds: z.string().array().min(1),
});
export type ReadNicknamesInput = z.infer<typeof readNicknamesInputSchema>;

const readMyUsersToRoomsInputSchema = z.object({ roomIds: selectRoomInMessageSchema.shape.id.array().min(1) });
export type ReadMyUsersToRoomsInput = z.infer<typeof readMyUsersToRoomsInputSchema>;

const onUpdateUserToRoomInputSchema = selectRoomInMessageSchema.shape.id.array().min(1).max(MAX_READ_LIMIT);
export type OnUpdateUserToRoomInput = z.infer<typeof onUpdateUserToRoomInputSchema>;

export const userToRoomRouter = router({
  onUpdateUserToRoom: standardAuthedProcedure.input(onUpdateUserToRoomInputSchema).subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    await isMember(ctx.db, ctx.getSessionPayload, input);
    for await (const [data] of on(userToRoomEventEmitter, "updateUserToRoom", { signal })) {
      if (!input.includes(data.roomId) || data.userId !== ctx.getSessionPayload.user.id) continue;
      yield data;
    }
  }),
  readMyUsersToRooms: standardAuthedProcedure.input(readMyUsersToRoomsInputSchema).query(async ({ ctx, input }) => {
    await isMember(ctx.db, ctx.getSessionPayload, input.roomIds);
    return ctx.db.query.usersToRoomsInMessage.findMany({
      where: { roomId: { in: input.roomIds }, userId: { eq: ctx.getSessionPayload.user.id } },
    });
  }),
  readNicknames: standardAuthedProcedure.input(readNicknamesInputSchema).query(async ({ ctx, input }) => {
    await isMember(ctx.db, ctx.getSessionPayload, [input.roomId]);
    return ctx.db.query.usersToRoomsInMessage.findMany({
      columns: { nickname: true, roomId: true, userId: true },
      where: { roomId: { eq: input.roomId }, userId: { in: input.userIds } },
    });
  }),
  updateUserToRoom: getMemberProcedure(updateUserToRoomInputSchema, "roomId").mutation(({ ctx, input }) =>
    updateUserToRoom(ctx.db, ctx.getSessionPayload.user.id, input),
  ),
});
