import { hasPermission } from "./hasPermission";
import { RoomPermission } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(hasPermission, () => {
  test("owner always has permission regardless of permission bits", () => {
    expect.hasAssertions();
    expect(hasPermission(0n, RoomPermission.ManageRoom, true)).toBe(true);
  });

  test("Administrator bit grants any permission", () => {
    expect.hasAssertions();
    expect(hasPermission(RoomPermission.Administrator, RoomPermission.ManageRoom, false)).toBe(true);
  });

  test("exact single-bit match returns true", () => {
    expect.hasAssertions();
    expect(hasPermission(RoomPermission.ReadMessages, RoomPermission.ReadMessages, false)).toBe(true);
  });

  test("missing single-bit returns false", () => {
    expect.hasAssertions();
    expect(hasPermission(RoomPermission.ReadMessages, RoomPermission.ManageRoom, false)).toBe(false);
  });

  test("combined mask: all bits present returns true", () => {
    expect.hasAssertions();
    const combined = RoomPermission.ReadMessages | RoomPermission.SendMessages;
    expect(hasPermission(combined, combined, false)).toBe(true);
  });

  test("combined mask: partial bit match returns false", () => {
    expect.hasAssertions();
    const combined = RoomPermission.ReadMessages | RoomPermission.SendMessages;
    expect(hasPermission(RoomPermission.ReadMessages, combined, false)).toBe(false);
  });
});
