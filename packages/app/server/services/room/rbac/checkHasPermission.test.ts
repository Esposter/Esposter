import { getMockSession } from "@@/server/trpc/context.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { checkHasPermission } from "@esposter/db";
import { RoomPermission } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(checkHasPermission, () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole, updateEveryoneRole } = setupRoomSuite();

  test("owner always has permission", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const hasManageRoom = await checkHasPermission(
      getMockContext().db,
      owner.id,
      getRoomId(),
      RoomPermission.ManageRoom,
    );

    expect(hasManageRoom).toBe(true);
  });

  test("returns false for non-existent room", async () => {
    expect.hasAssertions();

    const owner = getMockSession().user;
    const hasReadMessages = await checkHasPermission(
      getMockContext().db,
      owner.id,
      crypto.randomUUID(),
      RoomPermission.ReadMessages,
    );

    expect(hasReadMessages).toBe(false);
  });

  test("administrator bit grants all permissions", async () => {
    expect.hasAssertions();

    const { member } = await setupMemberWithRole(RoomPermission.Administrator, 1);
    const hasManageMessages = await checkHasPermission(
      getMockContext().db,
      member.id,
      getRoomId(),
      RoomPermission.ManageMessages,
    );

    expect(hasManageMessages).toBe(true);
  });

  test("specific permission check works", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await updateEveryoneRole(RoomPermission.ReadMessages);
    const [hasReadPermission, hasManagePermission] = await Promise.all([
      checkHasPermission(getMockContext().db, member.id, getRoomId(), RoomPermission.ReadMessages),
      checkHasPermission(getMockContext().db, member.id, getRoomId(), RoomPermission.ManageRoom),
    ]);

    expect(hasReadPermission).toBe(true);
    expect(hasManagePermission).toBe(false);
  });
});
