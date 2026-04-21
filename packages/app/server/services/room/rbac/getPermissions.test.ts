import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";
import type { User } from "better-auth";

import { getPermissions } from "@@/server/services/room/rbac/getPermissions";
import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRouter } from "@@/server/trpc/routers/room";
import { RoomPermission, roomRoles, rooms, users } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(getPermissions, () => {
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
    const { user: ownerUser } = await mockSessionOnce(mockContext.db);
    owner = ownerUser;
    const room = await roomCaller.createRoom({ name });
    roomId = room.id;
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("returns 0n with no roles", async () => {
    expect.hasAssertions();

    await mockContext.db.delete(roomRoles).where(eq(roomRoles.roomId, roomId));

    const result = await getPermissions(mockContext.db, crypto.randomUUID(), roomId);

    expect(result).toBe(0n);
  });

  test("returns @everyone permissions for all members", async () => {
    expect.hasAssertions();

    const everyonePerms = RoomPermission.ReadMessages | RoomPermission.SendMessages;
    const everyoneRole = takeOne(await mockContext.db.select().from(roomRoles).where(eq(roomRoles.roomId, roomId)));
    await mockSessionOnce(mockContext.db, owner);
    await roleCaller.updateRole({ id: everyoneRole.id, permissions: everyonePerms, roomId });

    const result = await getPermissions(mockContext.db, crypto.randomUUID(), roomId);

    expect(result).toBe(everyonePerms);
  });

  test("oRs @everyone + assigned role permissions", async () => {
    expect.hasAssertions();

    const everyoneRole = takeOne(await mockContext.db.select().from(roomRoles).where(eq(roomRoles.roomId, roomId)));
    await mockSessionOnce(mockContext.db, owner);
    await roleCaller.updateRole({ id: everyoneRole.id, permissions: RoomPermission.ReadMessages, roomId });
    await mockSessionOnce(mockContext.db, owner);
    const adminRole = await roleCaller.createRole({
      name: "Admin",
      permissions: RoomPermission.ManageRoom,
      position: 1,
      roomId,
    });
    const createdAt = new Date();
    // niche: non-owner user needed for createMembers/assignRole FK; mockSessionOnce would leak into next test
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
    await roleCaller.assignRole({ roleId: adminRole.id, roomId, userId: user.id });

    const result = await getPermissions(mockContext.db, user.id, roomId);

    expect(result).toBe(RoomPermission.ReadMessages | RoomPermission.ManageRoom);
  });
});
