import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { isManageable } from "@@/server/services/room/rbac/isManageable";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { rooms, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(isManageable, () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomCaller: DecorateRouterRecord<TRPCRouter["room"]>;
  let roomId: string;
  let ownerId: string;
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
    ownerId = owner.id;
    const room = await roomCaller.createRoom({ name });
    roomId = room.id;
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("owner can manage any target position", async () => {
    expect.hasAssertions();

    const result = await isManageable(mockContext.db, ownerId, roomId, 9999);

    expect(result).toBe(true);
  });

  test("returns false for non-existent room", async () => {
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
    const result = await isManageable(mockContext.db, user.id, crypto.randomUUID(), 0);

    expect(result).toBe(false);
  });

  test("user with higher top can manage lower position", async () => {
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

    const result = await isManageable(mockContext.db, user.id, roomId, 4);

    expect(result).toBe(true);
  });

  test("user cannot manage equal or higher position", async () => {
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

    const [equalPos, higherPos] = await Promise.all([
      isManageable(mockContext.db, user.id, roomId, 5),
      isManageable(mockContext.db, user.id, roomId, 6),
    ]);

    expect(equalPos).toBe(false);
    expect(higherPos).toBe(false);
  });
});
