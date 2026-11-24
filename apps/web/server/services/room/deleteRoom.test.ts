import { deleteRoom } from "#server/services/room/deleteRoom";
import { getMockSession } from "#server/trpc/context.test";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import {
  getLiveRowWhere,
  roomMemberPermissionsInMessage,
  RoomPermission,
  roomRolesInMessage,
} from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(deleteRoom, () => {
  const { createMember, getMockContext, getRoleCaller, getRoomId } = setupRoomSuite();
  const name = "name";

  // The roles and the override are kept as tombstones, so the room's rows are counted whole after the deletion, and
  // Only the live ones are read out of them
  test("tombstones the room's roles and every member's override with it", async () => {
    expect.hasAssertions();

    const db = getMockContext().db;
    const roomId = getRoomId();
    const member = await createMember();
    await getRoleCaller().createRole({ id: v7(), name, roomId });
    await getRoleCaller().upsertMemberPermissionOverride({
      allow: RoomPermission.ManageMessages,
      deny: 0n,
      inherit: 0n,
      roomId,
      userId: member.id,
    });
    const readLiveRoles = () =>
      db.query.roomRolesInMessage.findMany({ where: { RAW: getLiveRowWhere, roomId: { eq: roomId } } });
    const readLiveOverrides = () =>
      db.query.roomMemberPermissionsInMessage.findMany({ where: { RAW: getLiveRowWhere, roomId: { eq: roomId } } });
    await expect(readLiveRoles()).resolves.toHaveLength(2);
    await expect(readLiveOverrides()).resolves.toHaveLength(1);

    await deleteRoom({ db, user: getMockSession().user }, roomId);

    await expect(readLiveRoles()).resolves.toStrictEqual([]);
    await expect(readLiveOverrides()).resolves.toStrictEqual([]);
    await expect(
      db.select({ id: roomRolesInMessage.id }).from(roomRolesInMessage).where(eq(roomRolesInMessage.roomId, roomId)),
    ).resolves.toHaveLength(2);
    await expect(
      db
        .select({ userId: roomMemberPermissionsInMessage.userId })
        .from(roomMemberPermissionsInMessage)
        .where(eq(roomMemberPermissionsInMessage.roomId, roomId)),
    ).resolves.toHaveLength(1);
  });
});
