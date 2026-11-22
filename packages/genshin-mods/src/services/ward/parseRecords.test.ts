import { describe, expect, test } from "vitest";

import { parseRecords } from "./parseRecords";

describe(parseRecords, () => {
  test("reads a records file with a record in the wrong shape as holding none", () => {
    expect.hasAssertions();

    expect(parseRecords('{"a":{"editedAt":"0","sessionId":"a"}}')).toStrictEqual({});
  });
});
