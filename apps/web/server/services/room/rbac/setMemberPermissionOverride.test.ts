import type { MockDatabase } from "@esposter/db-mock";

import { setMemberPermissionOverride } from "#server/services/room/rbac/setMemberPermissionOverride";
import { getPermissions } from "@esposter/db";
import { createMockDb } from "@esposter/db-mock";
import {
  roomMemberPermissionsInMessage,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  usersInAuth,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(setMemberPermissionOverride, () => {
  // The highest bit a stored bitfield carries. It is read back from D1 as text, so it is exact where a JS number is not
  const highestBit = 1n << 62n;
  let mockDatabase: MockDatabase;

  // A room with one member and its @everyone role, which every member holds, so the override has a row to sit over
  const setupMember = async () => {
    const { db } = mockDatabase;
    const ownerId = v7();
    const userId = v7();
    const roomId = v7();
    await db.insert(usersInAuth).values([
      { email: `${ownerId}@example.com`, emailVerified: false, id: ownerId, name: ownerId },
      { email: `${userId}@example.com`, emailVerified: false, id: userId, name: userId },
    ]);
    await db.insert(roomsInMessage).values({ id: roomId, name: "room", userId: ownerId });
    await db.insert(usersToRoomsInMessage).values({ roomId, userId });
    await db
      .insert(roomRolesInMessage)
      .values({ isEveryone: true, name: "@everyone", permissions: RoomPermission.ReadMessages, roomId });
    return { roomId, userId };
  };

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("a bit past the number range reads back exact after it is allowed", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMember();

    const override = await setMemberPermissionOverride(mockDatabase.db, {
      allow: highestBit,
      deny: 0n,
      inherit: 0n,
      roomId,
      userId,
    });

    expect(override).toStrictEqual({ allow: highestBit, deny: 0n });
    await expect(getPermissions(mockDatabase.db, userId, roomId)).resolves.toBe(
      RoomPermission.ReadMessages | highestBit,
    );
  });

  test("moving a bit from allow to deny takes it away from the effective permissions", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMember();
    await setMemberPermissionOverride(mockDatabase.db, { allow: highestBit, deny: 0n, inherit: 0n, roomId, userId });

    const override = await setMemberPermissionOverride(mockDatabase.db, {
      allow: 0n,
      deny: highestBit,
      inherit: 0n,
      roomId,
      userId,
    });

    expect(override).toStrictEqual({ allow: 0n, deny: highestBit });
    await expect(getPermissions(mockDatabase.db, userId, roomId)).resolves.toBe(RoomPermission.ReadMessages);
  });

  test("a row with every bit returned to the roles is removed", async () => {
    expect.hasAssertions();

    const { roomId, userId } = await setupMember();
    await setMemberPermissionOverride(mockDatabase.db, { allow: highestBit, deny: 0n, inherit: 0n, roomId, userId });

    const override = await setMemberPermissionOverride(mockDatabase.db, {
      allow: 0n,
      deny: 0n,
      inherit: highestBit,
      roomId,
      userId,
    });

    expect(override).toStrictEqual({ allow: 0n, deny: 0n });
    await expect(mockDatabase.db.$count(roomMemberPermissionsInMessage)).resolves.toBe(0);
  });
});
