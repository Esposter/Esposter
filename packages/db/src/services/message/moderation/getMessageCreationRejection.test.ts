import type { Database } from "@esposter/db-schema";

import { createUser } from "#src/services/message/createUser.test";
import { getMessageCreationRejection } from "#src/services/message/moderation/getMessageCreationRejection";
import { createMockDb } from "@esposter/db-mock";
import {
  MessageCreationRejectionType,
  RoomPermission,
  roomRolesInMessage,
  roomsInMessage,
  RoomType,
  usersInAuth,
  usersToRoomRolesInMessage,
  usersToRoomsInMessage,
} from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";

describe(getMessageCreationRejection, () => {
  let db: Database;
  const name = "name";
  const roomId = v7();
  const directMessageRoomId = v7();
  const everyoneRoleId = v7();
  const administratorRoleId = v7();
  const ownerUserId = v7();
  const memberUserId = v7();
  const administratorUserId = v7();

  beforeAll(async () => {
    db = await createMockDb();
    await db
      .insert(usersInAuth)
      .values([ownerUserId, memberUserId, administratorUserId].map((id) => createUser(id, new Date(0), name)));
    await db.insert(roomsInMessage).values({ id: roomId, name, type: RoomType.Room, userId: ownerUserId });
    // A direct message carries no roles at all, so neither of its members is granted anything through one
    await db
      .insert(roomsInMessage)
      .values({
        id: directMessageRoomId,
        name: "",
        participantKey: "directMessage",
        type: RoomType.DirectMessage,
        userId: ownerUserId,
      });
    await db
      .insert(usersToRoomsInMessage)
      .values([ownerUserId, memberUserId].map((userId) => ({ roomId: directMessageRoomId, userId })));
    // The @everyone role gives every member the read permission alone, so a member holding no other role cannot send
    await db.insert(roomRolesInMessage).values([
      { id: everyoneRoleId, isEveryone: true, name, permissions: RoomPermission.ReadMessages, roomId },
      { id: administratorRoleId, name, permissions: RoomPermission.Administrator, roomId },
    ]);
    await db
      .insert(usersToRoomsInMessage)
      .values([ownerUserId, memberUserId, administratorUserId].map((userId) => ({ roomId, userId })));
    await db
      .insert(usersToRoomRolesInMessage)
      .values({ roleId: administratorRoleId, roomId, userId: administratorUserId });
  });

  afterEach(async () => {
    vi.useRealTimers();
    await db.update(roomsInMessage).set({ isReadOnly: false }).where(eq(roomsInMessage.id, roomId));
    await db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: null })
      .where(eq(usersToRoomsInMessage.userId, memberUserId));
  });

  test("rejects a member whose roles do not grant SendMessages", async () => {
    expect.hasAssertions();

    await expect(getMessageCreationRejection(db, memberUserId, roomId)).resolves.toStrictEqual({
      type: MessageCreationRejectionType.MissingPermission,
    });
  });

  test("passes a direct message participant, who holds no role", async () => {
    expect.hasAssertions();

    await expect(getMessageCreationRejection(db, memberUserId, directMessageRoomId)).resolves.toBeUndefined();
  });

  test("passes the owner, who holds every permission", async () => {
    expect.hasAssertions();

    await expect(getMessageCreationRejection(db, ownerUserId, roomId)).resolves.toBeUndefined();
  });

  test("passes a member whose role grants Administrator", async () => {
    expect.hasAssertions();

    await expect(getMessageCreationRejection(db, administratorUserId, roomId)).resolves.toBeUndefined();
  });

  test("reports a timeout ahead of a missing permission", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ now: 0 });
    await db
      .update(usersToRoomsInMessage)
      .set({ timeoutUntil: new Date(1) })
      .where(eq(usersToRoomsInMessage.userId, memberUserId));

    await expect(getMessageCreationRejection(db, memberUserId, roomId)).resolves.toStrictEqual({
      type: MessageCreationRejectionType.Timeout,
    });
  });

  test("reports a missing permission ahead of a read-only room", async () => {
    expect.hasAssertions();

    await db.update(roomsInMessage).set({ isReadOnly: true }).where(eq(roomsInMessage.id, roomId));

    await expect(getMessageCreationRejection(db, memberUserId, roomId)).resolves.toStrictEqual({
      type: MessageCreationRejectionType.MissingPermission,
    });
  });
});
