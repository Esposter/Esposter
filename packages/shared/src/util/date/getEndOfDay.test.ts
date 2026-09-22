import { getEndOfDay } from "#src/util/date/getEndOfDay";
import { describe, expect, test } from "vitest";

describe(getEndOfDay, () => {
  test("stretches to the last millisecond the day still holds", () => {
    expect.hasAssertions();

    expect(getEndOfDay(new Date(1970, 0, 1, 13))).toStrictEqual(new Date(1970, 0, 1, 23, 59, 59, 999));
  });
});
