import { getPermissions } from "@@/server/services/room/rbac/getPermissions";
import { createMockUser } from "@@/server/trpc/context.test";
import { setupRoomSuite } from "@@/server/trpc/routers/setupRoomSuite.test";
import { RoomPermission } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(getPermissions, () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole, updateEveryoneRole } = setupRoomSuite();
  const updatedPermissions = RoomPermission.ReadMessages | RoomPermission.SendMessages;

  test("returns 0n with no roles", async () => {
    expect.hasAssertions();

    const nonMember = await createMockUser(getMockContext().db);
    const permissions = await getPermissions(getMockContext().db, nonMember.id, getRoomId());

    expect(permissions).toBe(0n);
  });

  test("updates @everyone permissions for all members", async () => {
    expect.hasAssertions();

    const member = await createMember();
    await updateEveryoneRole(updatedPermissions);

    const permissions = await getPermissions(getMockContext().db, member.id, getRoomId());

    expect(permissions).toBe(updatedPermissions);
  });

  test("ors @everyone + assigned role permissions", async () => {
    expect.hasAssertions();

    const { member } = await setupMemberWithRole(RoomPermission.ManageRoom, 1);
    await updateEveryoneRole(RoomPermission.ReadMessages);

    const permissions = await getPermissions(getMockContext().db, member.id, getRoomId());

    expect(permissions).toBe(RoomPermission.ReadMessages | RoomPermission.ManageRoom);
  });
});
