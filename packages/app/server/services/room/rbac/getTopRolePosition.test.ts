import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, getMockSession } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { rooms } from "@esposter/db-schema";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(getTopRolePosition, () => {
  let mockContext: Context;
  let roleCaller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  let owner: User;
  const name = "name";
  const updatedName = "updatedName";
  const position = 5;
  const updatedPosition = 7;

  beforeAll(async () => {
    mockContext = await createMockContext();
    roleCaller = createCallerFactory(roleRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(async () => {
    owner = getMockSession().user;
    const room = await roomCaller.createRoom({ name });
    roomId = room.id;
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("returns -1 with no assigned roles", async () => {
    expect.hasAssertions();

    const result = await getTopRolePosition(mockContext.db, owner.id, roomId);

    expect(result).toBe(-1);
  });

  test("returns the assigned role position", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name, permissions: 0n, position, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: owner.id });

    const result = await getTopRolePosition(mockContext.db, owner.id, roomId);

    expect(result).toBe(position);
  });

  test("returns max position across multiple roles", async () => {
    expect.hasAssertions();

    const mod = await roleCaller.createRole({ name, permissions: 0n, position, roomId });
    const senior = await roleCaller.createRole({
      name: updatedName,
      permissions: 0n,
      position: updatedPosition,
      roomId,
    });
    await roleCaller.assignRole({ roleId: mod.id, roomId, userId: owner.id });
    await roleCaller.assignRole({ roleId: senior.id, roomId, userId: owner.id });

    const result = await getTopRolePosition(mockContext.db, owner.id, roomId);

    expect(result).toBe(updatedPosition);
  });

  test("returns positions across multiple rooms", async () => {
    expect.hasAssertions();

    const otherRoom = await roomCaller.createRoom({ name: "other" });
    const role1 = await roleCaller.createRole({ name, permissions: 0n, position, roomId });
    const role2 = await roleCaller.createRole({
      name: "senior",
      permissions: 0n,
      position: updatedPosition,
      roomId: otherRoom.id,
    });
    await roleCaller.assignRole({ roleId: role1.id, roomId, userId: owner.id });
    await roleCaller.assignRole({ roleId: role2.id, roomId: otherRoom.id, userId: owner.id });

    const result = await getTopRolePosition(mockContext.db, owner.id, [roomId, otherRoom.id]);

    expect(result.get(roomId)).toBe(position);
    expect(result.get(otherRoom.id)).toBe(updatedPosition);
  });
});
