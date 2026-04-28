import { updateRoomFilterInputSchema } from "#shared/models/db/room/UpdateRoomFilterInput";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getPermissionsProcedure } from "@@/server/trpc/procedure/room/getPermissionsProcedure";
import { roomFiltersInMessage, roomIdSchema, RoomPermission } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const roomFilterRouter = router({
  readRoomFilter: getMemberProcedure(roomIdSchema, "roomId").query(async ({ ctx, input: { roomId } }) => {
    const filter = await ctx.db.query.roomFiltersInMessage.findFirst({
      where: eq(roomFiltersInMessage.roomId, roomId),
    });
    return filter?.words ?? [];
  }),
  updateRoomFilter: getPermissionsProcedure(RoomPermission.ManageRoom, updateRoomFilterInputSchema, "roomId").mutation(
    async ({ ctx, input: { roomId, words } }) => {
      await ctx.db
        .insert(roomFiltersInMessage)
        .values({ roomId, words })
        .onConflictDoUpdate({ set: { words }, target: roomFiltersInMessage.roomId });
    },
  ),
});
