import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";
import { getMockSession } from "@@/server/trpc/context.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { describe, expect, test } from "vitest";

describe(getTopRolePosition, () => {
  const { getMockContext, getRoleCaller, getRoomCaller, getRoomId } = setupRoomSuite();
  const name = "name";
  const updatedName = "updatedName";
  const position = 5;
  const updatedPosition = 7;

  test("returns -1 with no assigned roles", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const topPosition = await getTopRolePosition(getMockContext().db, owner.id, getRoomId());

    expect(topPosition).toBe(-1);
  });

  test("returns the assigned role position", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const roleCaller = getRoleCaller();
    const roomId = getRoomId();
    const role = await roleCaller.createRole({ name, permissions: 0n, position, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: owner.id });

    const topPosition = await getTopRolePosition(getMockContext().db, owner.id, roomId);

    expect(topPosition).toBe(position);
  });

  test("returns max position across multiple roles", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const roleCaller = getRoleCaller();
    const roomId = getRoomId();
    const moderatorRole = await roleCaller.createRole({ name, permissions: 0n, position, roomId });
    const seniorRole = await roleCaller.createRole({
      name: updatedName,
      permissions: 0n,
      position: updatedPosition,
      roomId,
    });
    await roleCaller.assignRole({ roleId: moderatorRole.id, roomId, userId: owner.id });
    await roleCaller.assignRole({ roleId: seniorRole.id, roomId, userId: owner.id });

    const topPosition = await getTopRolePosition(getMockContext().db, owner.id, roomId);

    expect(topPosition).toBe(updatedPosition);
  });

  test("returns positions across multiple roomsInMessage", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const roleCaller = getRoleCaller();
    const roomId = getRoomId();
    const otherRoom = await getRoomCaller().createRoom({ name: updatedName });
    const role = await roleCaller.createRole({ name, permissions: 0n, position, roomId });
    const otherRole = await roleCaller.createRole({
      name: updatedName,
      permissions: 0n,
      position: updatedPosition,
      roomId: otherRoom.id,
    });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: owner.id });
    await roleCaller.assignRole({ roleId: otherRole.id, roomId: otherRoom.id, userId: owner.id });

    const topPositionMap = await getTopRolePosition(getMockContext().db, owner.id, [roomId, otherRoom.id]);

    expect(topPositionMap.get(roomId)).toBe(position);
    expect(topPositionMap.get(otherRoom.id)).toBe(updatedPosition);
  });
});
