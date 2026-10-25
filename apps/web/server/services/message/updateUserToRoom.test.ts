import { updateUserToRoom } from "#server/services/message/updateUserToRoom";
import { getMockSession } from "#server/trpc/context.test";
import { readRoomMembershipRows } from "#server/trpc/routers/readRoomMembershipRows.test";
import { setupRoomSuite } from "#server/trpc/routers/setupRoomSuite.test";
import { RoomPermission } from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(updateUserToRoom, () => {
  const { createMember, getMockContext, getRoomId, setupMemberWithRole } = setupRoomSuite();
  const displayName = "displayName";
  const position = 1;

  // A holder of the permission names a member the actor outranks, so the rename is written
  test("sets the display name of a member below the actor", async () => {
    expect.hasAssertions();

    const roomId = getRoomId();
    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageDisplayNames, position);
    const target = await createMember();
    const updatedUserToRoom = await updateUserToRoom(getMockContext().db, actor.id, {
      displayName,
      roomId,
      targetUserId: target.id,
    });

    expect(updatedUserToRoom.displayName).toBe(displayName);
  });

  // Equal is not below: a holder may not rename a moderator who ranks where they do, and the guard refuses before the
  // Write, so the name is left as it was
  test("refuses a member at the actor's position and leaves their name alone", async () => {
    expect.hasAssertions();

    const roomId = getRoomId();
    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageDisplayNames, position);
    const { member: target } = await setupMemberWithRole(0n, position);

    await expect(
      updateUserToRoom(getMockContext().db, actor.id, { displayName, roomId, targetUserId: target.id }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);

    const membershipRows = await readRoomMembershipRows(getMockContext().db, roomId, target.id);

    expect(takeOne(membershipRows).displayName).toBe("");
  });

  // Owner immunity is not a position comparison: the owner holds no role row, so no assigned role is below them
  test("refuses the room owner and leaves their name alone", async () => {
    expect.hasAssertions();

    const roomId = getRoomId();
    const ownerId = getMockSession().user.id;
    const { member: actor } = await setupMemberWithRole(RoomPermission.ManageDisplayNames, position);

    await expect(
      updateUserToRoom(getMockContext().db, actor.id, { displayName, roomId, targetUserId: ownerId }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: UNAUTHORIZED]`);

    const membershipRows = await readRoomMembershipRows(getMockContext().db, roomId, ownerId);

    expect(takeOne(membershipRows).displayName).toBe("");
  });

  // A member always may name themselves, so the permission and the hierarchy are asked only of another member
  test("sets the actor's own display name without the permission", async () => {
    expect.hasAssertions();

    const roomId = getRoomId();
    const member = await createMember();
    const updatedUserToRoom = await updateUserToRoom(getMockContext().db, member.id, {
      displayName,
      roomId,
      targetUserId: member.id,
    });

    expect(updatedUserToRoom.displayName).toBe(displayName);
  });
});
