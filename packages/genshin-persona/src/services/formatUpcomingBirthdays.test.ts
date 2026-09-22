import english from "#src/localizations/english";
import { TEST_EPOCH_DATE } from "#src/services/constants.test";
import { createCharacter } from "#src/services/createCharacter.test";
import { formatUpcomingBirthdays } from "#src/services/formatUpcomingBirthdays";
import { describe, expect, test } from "vitest";

// Named for the birthday, which is the one field the line reads and the one the assertions tell them apart by
const createBirthdayCharacter = (birthday: string) =>
  createCharacter({ birthday, displayName: birthday, name: birthday });

describe(formatUpcomingBirthdays, () => {
  const epoch = TEST_EPOCH_DATE;

  // The week reaches forward alone, today included and the session's own character left out, and the year wraps
  test("names the other birthdays of the week ahead, nearest first", () => {
    expect.hasAssertions();

    const roster = [
      createBirthdayCharacter("1/9"),
      createBirthdayCharacter("1/8"),
      createBirthdayCharacter("12/31"),
      createBirthdayCharacter("1/2"),
      createBirthdayCharacter(""),
      createBirthdayCharacter("1/1"),
      { ...createBirthdayCharacter("1/1"), name: " " },
    ];

    expect(formatUpcomingBirthdays(roster, epoch, "1/1", english)).toBe(
      "Birthdays this week: 1/1 1 January, 1/2 2 January and 1/8 8 January.",
    );
  });

  test("says nothing for a week with none", () => {
    expect.hasAssertions();

    expect(formatUpcomingBirthdays([createBirthdayCharacter("1/1")], epoch, "1/1", english)).toBe("");
  });
});
