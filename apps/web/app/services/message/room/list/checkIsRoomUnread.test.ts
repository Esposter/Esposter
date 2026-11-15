import type { RoomInMessage } from "@esposter/db-schema";

import { createRoom } from "#src/services/message/room/createRoom.test";
import { createUserToRoom } from "#src/services/message/room/createUserToRoom.test";
import { checkIsRoomUnread } from "#src/services/message/room/list/checkIsRoomUnread";
import { describe, expect, test } from "vitest";

describe(checkIsRoomUnread, () => {
  const joinedAt = new Date(Temporal.Duration.from({ seconds: 1 }).total("milliseconds"));
  const lastMessageAt = new Date(Temporal.Duration.from({ seconds: 2 }).total("milliseconds"));
  const readAfterLastMessageAt = new Date(
    Temporal.Duration.from({ milliseconds: 500, seconds: 2 }).total("milliseconds"),
  );
  const room = { ...createRoom("name"), lastMessageAt };

  test("is unread when the room got a message after the member last read it", () => {
    expect.hasAssertions();

    expect(
      checkIsRoomUnread(
        createUserToRoom({
          createdAt: joinedAt,
          lastReadAt: new Date(Temporal.Duration.from({ milliseconds: 500, seconds: 1 }).total("milliseconds")),
        }),
        room,
      ),
    ).toBe(true);
  });

  // A member who has never read the room has read nothing since they joined it
  test("is unread for a member who never read it, when it got a message after they joined", () => {
    expect.hasAssertions();

    expect(checkIsRoomUnread(createUserToRoom({ createdAt: joinedAt, lastReadAt: null }), room)).toBe(true);
  });

  test("is read once the member has read it past its last message", () => {
    expect.hasAssertions();

    expect(checkIsRoomUnread(createUserToRoom({ createdAt: joinedAt, lastReadAt: readAfterLastMessageAt }), room)).toBe(
      false,
    );
  });

  // A settings edit moves the update time past the member's read, and no message did, so the room stays read
  test("is read when only its settings changed after the member last read it", () => {
    expect.hasAssertions();

    const settingsEdited: RoomInMessage = {
      ...room,
      updatedAt: new Date(Temporal.Duration.from({ seconds: 3 }).total("milliseconds")),
    };

    expect(
      checkIsRoomUnread(createUserToRoom({ createdAt: joinedAt, lastReadAt: readAfterLastMessageAt }), settingsEdited),
    ).toBe(false);
  });
});
