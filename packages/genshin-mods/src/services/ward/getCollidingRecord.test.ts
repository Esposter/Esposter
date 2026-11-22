import { describe, expect, test } from "vitest";

import { WARD_WINDOW_MS } from "../constants";
import { getCollidingRecord } from "./getCollidingRecord";

describe(getCollidingRecord, () => {
  const OWN_SESSION_ID = "00000000-0000-4000-8000-000000000000";
  const PEER_SESSION_ID = "00000000-0000-4000-8000-000000000001";
  const record = { editedAt: 0, sessionId: OWN_SESSION_ID };

  test("asks for another session's edit inside the window", () => {
    expect.hasAssertions();

    expect(getCollidingRecord(record, PEER_SESSION_ID, WARD_WINDOW_MS - 1)).toStrictEqual(record);
  });

  test.each([
    ["the session's own edit", OWN_SESSION_ID, 0],
    ["an edit past the window", PEER_SESSION_ID, WARD_WINDOW_MS],
  ])("never asks for %s", (_description, sessionId, now) => {
    expect.hasAssertions();

    expect(getCollidingRecord(record, sessionId, now)).toBeUndefined();
  });
});
