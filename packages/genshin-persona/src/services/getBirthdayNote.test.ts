import english from "#src/localizations/english";
import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { getBirthdayNote } from "#src/services/getBirthdayNote";
import { readLocalization } from "#src/services/readLocalization";
import { describe, expect, test } from "vitest";

describe(getBirthdayNote, () => {
  const epoch = TEST_EPOCH_DATE;

  test.each([
    ["1/1", "[Birthday: 1 January, today]"],
    ["1/2", "[Birthday: 2 January, tomorrow]"],
    ["1/3", "[Birthday: 3 January, in 2 days]"],
    ["12/31", "[Birthday: 31 December, yesterday]"],
    ["12/30", "[Birthday: 30 December, 2 days ago]"],
    ["", ""],
  ])("%s: reads as the note the card prints", (birthday, expected) => {
    expect.hasAssertions();

    expect(getBirthdayNote(birthday, epoch, english)).toBe(expected);
  });

  // The aside is the plugin speaking rather than the character, so it is translated: the date against the
  // Language's own locale and the distance in its own words
  test("reads in the interface language, date and distance together", async () => {
    expect.hasAssertions();

    const localization = await readLocalization("Japanese");

    expect(getBirthdayNote("1/1", epoch, localization)).toBe("[誕生日：1/1、本日]");
  });
});
