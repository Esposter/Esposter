import { getMockSession } from "@@/server/trpc/context.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { hasPermission } from "@esposter/db";
import { RoomPermission } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(hasPermission, () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole, updateEveryoneRole } = setupRoomSuite();

  test("owner always has permission", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const result = await hasPermission(getMockContext().db, owner.id, getRoomId(), RoomPermission.ManageRoom);

    expect(result).toBe(true);
  });

  test("returns false for non-existent room", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const result = await hasPermission(getMockContext().db, owner.id, crypto.randomUUID(), RoomPermission.ReadMessages);

    expect(result).toBe(false);
  });

  test("administrator bit grants all permissions", async () => {
    expect.hasAssertions();

    const { member } = await setupMemberWithRole(RoomPermission.Administrator, 1);
    const result = await hasPermission(getMockContext().db, member.id, getRoomId(), RoomPermission.ManageMessages);

    expect(result).toBe(true);
  });

  test("specific permission check works", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await updateEveryoneRole(RoomPermission.ReadMessages);
    const [hasReadPermission, hasManagePermission] = await Promise.all([
      hasPermission(getMockContext().db, member.id, getRoomId(), RoomPermission.ReadMessages),
      hasPermission(getMockContext().db, member.id, getRoomId(), RoomPermission.ManageRoom),
    ]);

    expect(hasReadPermission).toBe(true);
    expect(hasManagePermission).toBe(false);
  });
});
