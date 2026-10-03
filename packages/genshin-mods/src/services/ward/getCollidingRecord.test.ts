import { describe, expect, test } from "vitest";

import { WARD_WINDOW_MS } from "../constants";
import { getCollidingRecord } from "./getCollidingRecord";

describe(getCollidingRecord, () => {
  const record = { editedAt: 0, sessionId: "a" };

  test("asks for another session's edit inside the window", () => {
    expect.hasAssertions();

    expect(getCollidingRecord(record, "b", WARD_WINDOW_MS - 1)).toStrictEqual(record);
  });

  test.each([
    ["the session's own edit", "a", 0],
    ["an edit past the window", "b", WARD_WINDOW_MS],
  ])("never asks for %s", (_, sessionId, now) => {
    expect.hasAssertions();

    expect(getCollidingRecord(record, sessionId, now)).toBeUndefined();
  });
});
