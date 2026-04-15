import type { Context } from "@@/server/trpc/context";
import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext, mockSessionOnce, replayMockSession } from "@@/server/trpc/context.test";
import { roleRouter } from "@@/server/trpc/routers/role";
import { roomRoles, rooms, RoomType, usersToRooms } from "@esposter/db-schema";
import { RoomPermission } from "@esposter/shared";
import { eq } from "drizzle-orm";
import { afterEach, beforeAll, describe, expect, test } from "vitest";

describe("role", () => {
  let mockContext: Context;
  let caller: DecorateRouterRecord<TRPCRouter["role"]>;
  let roomId: string;

  const setupRoom = async () => {
    const { user: owner } = await mockSessionOnce(mockContext.db);
    const room = (
      await mockContext.db.insert(rooms).values({ name: "", type: RoomType.Room, userId: owner.id }).returning()
    )[0]!;
    await mockContext.db.insert(usersToRooms).values({ roomId: room.id, userId: owner.id });
    await mockContext.db.insert(roomRoles).values({
      isEveryone: true,
      name: "@everyone",
      permissions: RoomPermission.ReadMessages | RoomPermission.SendMessages,
      position: 0,
      roomId: room.id,
    });
    return { owner, roomId: room.id };
  };

  beforeAll(async () => {
    mockContext = await createMockContext();
    caller = createCallerFactory(roleRouter)(mockContext);
  });

  afterEach(async () => {
    await mockContext.db.delete(rooms);
  });

  test("reads empty roles (only @everyone)", async () => {
    expect.hasAssertions();

    const { owner } = await setupRoom();
    roomId = (await mockContext.db.select().from(rooms).where(eq(rooms.userId, owner.id)))[0]!.id;
    replayMockSession({
      session: {
        createdAt: new Date(),
        expiresAt: new Date(),
        id: "",
        token: "",
        updatedAt: new Date(),
        userId: owner.id,
      },
      user: owner,
    });

    const roles = await caller.readRoles({ roomId });

    expect(roles.length).toBeGreaterThanOrEqual(1);
    expect(roles.some(({ isEveryone }) => isEveryone)).toBe(true);
  });

  test("creates role (owner)", async () => {
    expect.hasAssertions();

    const { owner, roomId: rid } = await setupRoom();
    roomId = rid;
    replayMockSession({
      session: {
        createdAt: new Date(),
        expiresAt: new Date(),
        id: "",
        token: "",
        updatedAt: new Date(),
        userId: owner.id,
      },
      user: owner,
    });

    const role = await caller.createRole({
      name: "Mod",
      permissions: RoomPermission.ManageMessages,
      position: 0,
      roomId,
    });

    expect(role.name).toBe("Mod");
    expect(role.permissions).toBe(RoomPermission.ManageMessages);
    expect(role.roomId).toBe(roomId);
  });

  test("updates role (owner)", async () => {
    expect.hasAssertions();

    const { owner, roomId: rid } = await setupRoom();
    roomId = rid;
    replayMockSession({
      session: {
        createdAt: new Date(),
        expiresAt: new Date(),
        id: "",
        token: "",
        updatedAt: new Date(),
        userId: owner.id,
      },
      user: owner,
    });
    const created = await caller.createRole({ name: "Mod", permissions: 0n, position: 0, roomId });

    replayMockSession({
      session: {
        createdAt: new Date(),
        expiresAt: new Date(),
        id: "",
        token: "",
        updatedAt: new Date(),
        userId: owner.id,
      },
      user: owner,
    });
    const updated = await caller.updateRole({ id: created.id, name: "Senior Mod", roomId });

    expect(updated.name).toBe("Senior Mod");
    expect(updated.id).toBe(created.id);
  });

  test("deletes role (owner)", async () => {
    expect.hasAssertions();

    const { owner, roomId: rid } = await setupRoom();
    roomId = rid;
    replayMockSession({
      session: {
        createdAt: new Date(),
        expiresAt: new Date(),
        id: "",
        token: "",
        updatedAt: new Date(),
        userId: owner.id,
      },
      user: owner,
    });
    const created = await caller.createRole({ name: "Mod", permissions: 0n, position: 0, roomId });

    replayMockSession({
      session: {
        createdAt: new Date(),
        expiresAt: new Date(),
        id: "",
        token: "",
        updatedAt: new Date(),
        userId: owner.id,
      },
      user: owner,
    });
    const deleted = await caller.deleteRole({ id: created.id, roomId });

    expect(deleted.id).toBe(created.id);
  });

  test("cannot delete @everyone role", async () => {
    expect.hasAssertions();

    const { owner, roomId: rid } = await setupRoom();
    roomId = rid;
    const everyoneRole = (await mockContext.db.select().from(roomRoles).where(eq(roomRoles.roomId, roomId)))[0]!;
    replayMockSession({
      session: {
        createdAt: new Date(),
        expiresAt: new Date(),
        id: "",
        token: "",
        updatedAt: new Date(),
        userId: owner.id,
      },
      user: owner,
    });

    await expect(caller.deleteRole({ id: everyoneRole.id, roomId })).rejects.toThrow();
  });

  test("unauthorized without ManageRoles permission", async () => {
    expect.hasAssertions();

    const { roomId: rid } = await setupRoom();
    roomId = rid;
    const { user: member } = await mockSessionOnce(mockContext.db);
    await mockContext.db.insert(usersToRooms).values({ roomId, userId: member.id });

    await expect(caller.createRole({ name: "Mod", permissions: 0n, position: 0, roomId })).rejects.toThrow();
  });
});
