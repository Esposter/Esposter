import type { MonthDay } from "#src/models/MonthDay";

import { getBirthdayNote } from "#src/services/getBirthdayNote";
import { describe, expect, test } from "vitest";

describe(getBirthdayNote, () => {
  const epoch: MonthDay = { day: 1, month: 1 };

  test.each([
    ["1/1", "[birthday 1 January, today]"],
    ["1/2", "[birthday 2 January, tomorrow]"],
    ["1/3", "[birthday 3 January, in 2 days]"],
    ["12/31", "[birthday 31 December, yesterday]"],
    ["12/30", "[birthday 30 December, 2 days ago]"],
    ["", ""],
  ])("%s: reads as the note the card prints", (birthday, expected) => {
    expect.hasAssertions();

    expect(getBirthdayNote(birthday, epoch)).toBe(expected);
  });
});
