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

    const result = await getTopRolePosition(mockContext.db, owner.id, [roomId]);

    expect(result).toBe(-1);
  });

  test("returns the assigned role position", async () => {
    expect.hasAssertions();

    const role = await roleCaller.createRole({ name: "Mod", permissions: 0n, position: 5, roomId });
    await roleCaller.assignRole({ roleId: role.id, roomId, userId: owner.id });

    const result = await getTopRolePosition(mockContext.db, owner.id, [roomId]);

    expect(result).toBe(5);
  });

  test("returns max position across multiple roles", async () => {
    expect.hasAssertions();

    const mod = await roleCaller.createRole({ name: "Mod", permissions: 0n, position: 3, roomId });
    const senior = await roleCaller.createRole({ name: "Senior", permissions: 0n, position: 7, roomId });
    await roleCaller.assignRole({ roleId: mod.id, roomId, userId: owner.id });
    await roleCaller.assignRole({ roleId: senior.id, roomId, userId: owner.id });

    const result = await getTopRolePosition(mockContext.db, owner.id, [roomId]);

    expect(result).toBe(7);
  });
});
