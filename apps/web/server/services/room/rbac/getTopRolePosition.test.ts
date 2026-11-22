import { getTopRolePosition } from "#server/services/room/rbac/getTopRolePosition";
import { getMockSession } from "#server/trpc/context.test";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getTopRolePosition, () => {
  const { getMockContext, getRoleCaller, getRoomId } = setupRoomSuite();
  const name = "name";
  const updatedName = "updatedName";
  const position = 1;
  const updatedPosition = position + 1;

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
    const role = await roleCaller.createRole({ id: v7(), name, position, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: owner.id });

    const topPosition = await getTopRolePosition(getMockContext().db, owner.id, roomId);

    expect(topPosition).toBe(position);
  });

  test("returns max position across multiple roles", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const roleCaller = getRoleCaller();
    const roomId = getRoomId();
    const moderatorRole = await roleCaller.createRole({ id: v7(), name, position, roomId });
    const seniorRole = await roleCaller.createRole({ id: v7(), name: updatedName, position: updatedPosition, roomId });
    await roleCaller.assignRole({ roleId: moderatorRole.id, roomId, userId: owner.id });
    await roleCaller.assignRole({ roleId: seniorRole.id, roomId, userId: owner.id });

    const topPosition = await getTopRolePosition(getMockContext().db, owner.id, roomId);

    expect(topPosition).toBe(updatedPosition);
  });
});
