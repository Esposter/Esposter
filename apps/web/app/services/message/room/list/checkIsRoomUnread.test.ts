import { createUserToRoom } from "@/services/message/room/createUserToRoom.test";
import { checkIsRoomUnread } from "@/services/message/room/list/checkIsRoomUnread";
import { describe, expect, test } from "vitest";

describe(checkIsRoomUnread, () => {
  const joinedAt = new Date(1000);
  const updatedAt = new Date(2000);

  test("is unread when the room was updated after the member last read it", () => {
    expect.hasAssertions();

    expect(checkIsRoomUnread(createUserToRoom({ createdAt: joinedAt, lastReadAt: new Date(1500) }), updatedAt)).toBe(
      true,
    );
  });

  // A member who has never read the room has read nothing since they joined it
  test("is unread for a member who never read it, when it was updated after they joined", () => {
    expect.hasAssertions();

    expect(checkIsRoomUnread(createUserToRoom({ createdAt: joinedAt, lastReadAt: null }), updatedAt)).toBe(true);
  });

  test("is read once the member has read it past its last update", () => {
    expect.hasAssertions();

    expect(checkIsRoomUnread(createUserToRoom({ createdAt: joinedAt, lastReadAt: new Date(2500) }), updatedAt)).toBe(
      false,
    );
  });
});
