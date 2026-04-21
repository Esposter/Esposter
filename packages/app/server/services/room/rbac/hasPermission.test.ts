import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { hasPermission } from "@@/server/services/room/rbac/hasPermission";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { RoomPermission, roomRoles, rooms, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(hasPermission, () => {
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

  test("owner always has permission", async () => {
    expect.hasAssertions();

    const result = await hasPermission(mockContext.db, ownerId, roomId, RoomPermission.ManageRoom);

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
    const result = await hasPermission(mockContext.db, user.id, crypto.randomUUID(), RoomPermission.ReadMessages);

    expect(result).toBe(false);
  });

  test("administrator bit grants all permissions", async () => {
    expect.hasAssertions();

    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));
    await mockSessionOnce(mockContext.db, owner);
    const adminRole = await caller.createRole({
      name: "Admin",
      permissions: RoomPermission.Administrator,
      position: 1,
      roomId,
    });
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
    await caller.assignRole({ roleId: adminRole.id, roomId, userId: user.id });

    const result = await hasPermission(mockContext.db, user.id, roomId, RoomPermission.ManageMessages);

    expect(result).toBe(true);
  });

  test("specific permission check works", async () => {
    expect.hasAssertions();

    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));
    await mockContext.db
      .insert(roomRoles)
      .values({ isEveryone: true, name: "@everyone", permissions: RoomPermission.ReadMessages, position: 0, roomId });
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

    const [canRead, canManage] = await Promise.all([
      hasPermission(mockContext.db, user.id, roomId, RoomPermission.ReadMessages),
      hasPermission(mockContext.db, user.id, roomId, RoomPermission.ManageRoom),
    ]);

    expect(canRead).toBe(true);
    expect(canManage).toBe(false);
  });
});
