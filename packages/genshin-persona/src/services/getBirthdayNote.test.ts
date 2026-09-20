import { LEAP_YEAR } from "#src/services/constants";
import { getBirthdayNote } from "#src/services/getBirthdayNote";
import { describe, expect, test } from "vitest";

describe(getBirthdayNote, () => {
  const epoch = Temporal.PlainDate.from({ day: 1, month: 1, year: LEAP_YEAR });

  test.each([
    ["1/1", "[Birthday: 1 January, today]"],
    ["1/2", "[Birthday: 2 January, tomorrow]"],
    ["1/3", "[Birthday: 3 January, in 2 days]"],
    ["12/31", "[Birthday: 31 December, yesterday]"],
    ["12/30", "[Birthday: 30 December, 2 days ago]"],
    ["", ""],
  ])("%s: reads as the note the card prints", (birthday, expected) => {
    expect.hasAssertions();

    expect(getBirthdayNote(birthday, epoch)).toBe(expected);
  });
});
