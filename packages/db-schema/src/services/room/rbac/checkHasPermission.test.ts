import { RoomPermission } from "#src/schema/roomRolesInMessage";
import { checkHasPermission } from "#src/services/room/rbac/checkHasPermission";
import { describe, expect, test } from "vitest";

describe(checkHasPermission, () => {
  test("owner always has permission regardless of permission bits", () => {
    expect.hasAssertions();
    expect(checkHasPermission(0n, RoomPermission.ManageRoom, true)).toBe(true);
  });

  test("administrator bit grants any permission", () => {
    expect.hasAssertions();
    expect(checkHasPermission(RoomPermission.Administrator, RoomPermission.ManageRoom, false)).toBe(true);
  });

  test("exact single-bit match returns true", () => {
    expect.hasAssertions();
    expect(checkHasPermission(RoomPermission.ReadMessages, RoomPermission.ReadMessages, false)).toBe(true);
  });

  test("missing single-bit returns false", () => {
    expect.hasAssertions();
    expect(checkHasPermission(RoomPermission.ReadMessages, RoomPermission.ManageRoom, false)).toBe(false);
  });

  test("combined mask: all bits present returns true", () => {
    expect.hasAssertions();

    const combinedPermissions = RoomPermission.ReadMessages | RoomPermission.SendMessages;

    expect(checkHasPermission(combinedPermissions, combinedPermissions, false)).toBe(true);
  });

  test("combined mask: partial bit match returns false", () => {
    expect.hasAssertions();

    const combinedPermissions = RoomPermission.ReadMessages | RoomPermission.SendMessages;

    expect(checkHasPermission(RoomPermission.ReadMessages, combinedPermissions, false)).toBe(false);
  });
});
