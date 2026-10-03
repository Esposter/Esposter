import { describe, expect, test } from "vitest";

import { WARD_WINDOW_MS } from "../constants";
import { getRecordsWithEdit } from "./getRecordsWithEdit";

describe(getRecordsWithEdit, () => {
  test("records the edit and drops every record past the window", () => {
    expect.hasAssertions();

    const record = { editedAt: WARD_WINDOW_MS, sessionId: "a" };

    expect(getRecordsWithEdit({ a: { editedAt: 0, sessionId: "a" } }, "b", record)).toStrictEqual({ b: record });
  });
});
