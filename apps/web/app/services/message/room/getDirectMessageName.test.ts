import { RoomType } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

import { createRoom } from "./createRoom.test";
import { getDirectMessageName } from "./getDirectMessageName";

describe("getDirectMessageName", () => {
  test("names a direct message by its participants, falling back to the account name for an empty display name", () => {
    expect.hasAssertions();

    const room = createRoom("", RoomType.DirectMessage);

    expect(
      getDirectMessageName(room, [
        { displayName: "", name: "Alice" },
        { displayName: "Bobby", name: "Bob" },
      ]),
    ).toBe("Alice, Bobby");
  });
});
