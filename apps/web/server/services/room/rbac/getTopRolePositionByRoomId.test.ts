import { getTopRolePositionByRoomId } from "#server/services/room/rbac/getTopRolePositionByRoomId";
import { getMockSession } from "#server/trpc/context.test";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getTopRolePositionByRoomId, () => {
  const { getMockContext, getRoleCaller, getRoomCaller, getRoomId } = setupRoomSuite();
  const name = "name";
  const updatedName = "updatedName";
  const position = 1;
  const updatedPosition = position + 1;

  test("returns positions across multiple roomsInMessage", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const roleCaller = getRoleCaller();
    const roomId = getRoomId();
    const otherRoom = await getRoomCaller().createRoom({ name: updatedName });
    const role = await roleCaller.createRole({ id: v7(), name, position, roomId });
    const otherRole = await roleCaller.createRole({
      id: v7(),
      name: updatedName,
      position: updatedPosition,
      roomId: otherRoom.id,
    });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: owner.id });
    await roleCaller.assignRole({ roleId: otherRole.id, roomId: otherRoom.id, userId: owner.id });

    const topPositionMap = await getTopRolePositionByRoomId(getMockContext().db, owner.id, [roomId, otherRoom.id]);

    expect(topPositionMap.get(roomId)).toBe(position);
    expect(topPositionMap.get(otherRoom.id)).toBe(updatedPosition);
  });
});
