import { isRoomId } from "@@/server/services/message/isRoomId";
import { describe, expect, test } from "vitest";

describe(isRoomId, () => {
  test("compares", () => {
    expect.hasAssertions();

    expect(isRoomId("", "")).toBe(true);
    expect(isRoomId("", " ")).toBe(false);
  });
});
