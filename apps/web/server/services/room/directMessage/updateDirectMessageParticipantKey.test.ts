import type { MockDatabase } from "@esposter/db-mock";

import { getDirectMessageParticipantKey } from "#server/services/room/directMessage/getDirectMessageParticipantKey";
import { updateDirectMessageParticipantKey } from "#server/services/room/directMessage/updateDirectMessageParticipantKey";
import { createMockDb } from "@esposter/db-mock";
import { roomsInMessage, RoomType, usersInAuth } from "@esposter/db-schema";
import { eq } from "drizzle-orm";
import { v7 } from "uuid";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";

describe(updateDirectMessageParticipantKey, () => {
  let mockDatabase: MockDatabase;

  beforeAll(async () => {
    mockDatabase = await createMockDb();
  });

  afterEach(async () => {
    await mockDatabase.reset();
  });

  afterAll(async () => {
    await mockDatabase.dispose();
  });

  test("refuses a key written against a key a concurrent change has replaced, and keeps the key that change set", async () => {
    expect.hasAssertions();

    const { db } = mockDatabase;
    const firstUserId = v7();
    const secondUserId = v7();
    const thirdUserId = v7();
    const fourthUserId = v7();
    const roomId = v7();
    await db
      .insert(usersInAuth)
      .values(
        [firstUserId, secondUserId, thirdUserId, fourthUserId].map((id) => ({
          email: `${id}@example.com`,
          emailVerified: false,
          id,
          name: id,
        })),
      );
    const staleKey = getDirectMessageParticipantKey([firstUserId, secondUserId]);
    await db
      .insert(roomsInMessage)
      .values({ id: roomId, participantKey: staleKey, type: RoomType.DirectMessage, userId: firstUserId });
    const isKeyStale = eq(roomsInMessage.participantKey, staleKey);

    // A concurrent add lands first, so the room now holds the key of the three it names
    const concurrentRows = await updateDirectMessageParticipantKey(db, roomId, isKeyStale, [
      firstUserId,
      secondUserId,
      thirdUserId,
    ]);
    // The other add was computed from the list before that one landed, and its write matches no row
    const staleRows = await updateDirectMessageParticipantKey(db, roomId, isKeyStale, [
      firstUserId,
      secondUserId,
      fourthUserId,
    ]);
    const room = await db.query.roomsInMessage.findFirst({
      columns: { participantKey: true },
      where: { id: { eq: roomId } },
    });

    expect(concurrentRows).toHaveLength(1);
    expect(staleRows).toStrictEqual([]);
    expect(room).toStrictEqual({
      participantKey: getDirectMessageParticipantKey([firstUserId, secondUserId, thirdUserId]),
    });
  });
});
