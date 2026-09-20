import type { Character } from "#src/models/Character";
import type { MonthDay } from "#src/models/MonthDay";

import { getBirthdayLine } from "#src/services/getBirthdayLine";
import { describe, expect, test } from "vitest";

describe(getBirthdayLine, () => {
  const epoch: MonthDay = { day: 1, month: 1 };
  const name = "name";
  const createCharacter = (birthday: string): Character => ({
    birthday,
    element: "",
    name,
    region: "",
    title: "",
    version: "",
  });

  test.each([
    ["1/1", `Today is ${name}'s birthday.`],
    ["1/2", `${name}'s birthday is tomorrow.`],
    ["1/3", `${name}'s birthday is in 2 days.`],
    ["12/31", `${name}'s birthday was yesterday.`],
    ["12/30", `${name}'s birthday was 2 days ago.`],
    ["", ""],
  ])("%s: reads as the line the card prints", (birthday, expected) => {
    expect.hasAssertions();

    expect(getBirthdayLine(createCharacter(birthday), epoch)).toBe(expected);
  });
});
