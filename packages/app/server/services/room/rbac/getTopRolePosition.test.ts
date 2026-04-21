import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { getTopRolePosition } from "@@/server/services/room/rbac/getTopRolePosition";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { rooms, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(getTopRolePosition, () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  let owner: User;
  const name = "name";

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(roleRouter)(mockContext);
    roomCaller = createCallerFactory(roomRouter)(mockContext);
  });

  beforeEach(async () => {
    const { user: ownerUser } = await mockSessionOnce(mockContext.db);
    owner = ownerUser;
    const room = await roomCaller.createRoom({ name });
    roomId = room.id;
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("returns -1 with no assigned roles", async () => {
    expect.hasAssertions();

    const createdAt = new Date();
    const user = takeOne(
      await mockContext.db
        .insert(users)
        .values({
          createdAt,
          email: crypto.randomUUID(),
          emailVerified: true,
          id: crypto.randomUUID(),
          image: null,
          name: crypto.randomUUID(),
          updatedAt: createdAt,
        })
        .returning(),
    );
    await mockSessionOnce(mockContext.db, owner);
    await roomCaller.createMembers({ roomId, userIds: [user.id] });

    const result = await getTopRolePosition(mockContext.db, user.id, roomId);

    expect(result).toBe(-1);
  });

  test("returns the assigned role position", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db, owner);
    const role = await caller.createRole({ name: "Mod", permissions: 0n, position: 5, roomId });
    const createdAt = new Date();
    const user = takeOne(
      await mockContext.db
        .insert(users)
        .values({
          createdAt,
          email: crypto.randomUUID(),
          emailVerified: true,
          id: crypto.randomUUID(),
          image: null,
          name: crypto.randomUUID(),
          updatedAt: createdAt,
        })
        .returning(),
    );
    await mockSessionOnce(mockContext.db, owner);
    await roomCaller.createMembers({ roomId, userIds: [user.id] });
    await mockSessionOnce(mockContext.db, owner);
    await caller.assignRole({ roleId: role.id, roomId, userId: user.id });

    const result = await getTopRolePosition(mockContext.db, user.id, roomId);

    expect(result).toBe(5);
  });

  test("returns max position across multiple roles", async () => {
    expect.hasAssertions();

    await mockSessionOnce(mockContext.db, owner);
    const mod = await caller.createRole({ name: "Mod", permissions: 0n, position: 3, roomId });
    await mockSessionOnce(mockContext.db, owner);
    const senior = await caller.createRole({ name: "Senior", permissions: 0n, position: 7, roomId });
    const createdAt = new Date();
    const user = takeOne(
      await mockContext.db
        .insert(users)
        .values({
          createdAt,
          email: crypto.randomUUID(),
          emailVerified: true,
          id: crypto.randomUUID(),
          image: null,
          name: crypto.randomUUID(),
          updatedAt: createdAt,
        })
        .returning(),
    );
    await mockSessionOnce(mockContext.db, owner);
    await roomCaller.createMembers({ roomId, userIds: [user.id] });
    await mockSessionOnce(mockContext.db, owner);
    await caller.assignRole({ roleId: mod.id, roomId, userId: user.id });
    await mockSessionOnce(mockContext.db, owner);
    await caller.assignRole({ roleId: senior.id, roomId, userId: user.id });

    const result = await getTopRolePosition(mockContext.db, user.id, roomId);

    expect(result).toBe(7);
  });
});
