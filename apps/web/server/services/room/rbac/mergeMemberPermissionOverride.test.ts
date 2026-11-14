import { mergeMemberPermissionOverride } from "#server/services/room/rbac/mergeMemberPermissionOverride";
import { RoomPermission } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(mergeMemberPermissionOverride, () => {
  // The highest bit a stored bitfield carries, past the 53 bits a JS number reads back exact
  const highestBit = 1n << 62n;

  test("moves a bit from deny to allow rather than setting it in both", () => {
    expect.hasAssertions();

    const override = mergeMemberPermissionOverride(
      { allow: 0n, deny: highestBit },
      { allow: highestBit, deny: 0n, inherit: 0n },
    );

    expect(override).toStrictEqual({ allow: highestBit, deny: 0n });
  });

  test("returns a named bit to the roles from both fields and leaves the others as they were", () => {
    expect.hasAssertions();

    const override = mergeMemberPermissionOverride(
      { allow: highestBit | RoomPermission.ReadMessages, deny: RoomPermission.SendMessages },
      { allow: 0n, deny: 0n, inherit: highestBit | RoomPermission.SendMessages },
    );

    expect(override).toStrictEqual({ allow: RoomPermission.ReadMessages, deny: 0n });
  });
});
