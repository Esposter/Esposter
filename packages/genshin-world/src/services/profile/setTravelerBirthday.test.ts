import type { TravelerBirthdaySave } from "#src/models/save/TravelerBirthdaySave";

import { setTravelerBirthday } from "#src/services/profile/setTravelerBirthday";
import { describe, expect, test } from "vitest";

describe(setTravelerBirthday, () => {
  const BIRTHDAY: TravelerBirthdaySave = { day: 13, month: 10 };
  const LATER_BIRTHDAY: TravelerBirthdaySave = { day: 2, month: 3 };
  const NO_SUCH_DAY: TravelerBirthdaySave = { day: 31, month: 4 };
  const LEAP_DAY: TravelerBirthdaySave = { day: 29, month: 2 };

  test("a birthday is set when none is held", () => {
    expect.hasAssertions();

    expect(setTravelerBirthday(undefined, BIRTHDAY)).toStrictEqual(BIRTHDAY);
  });

  test("a held birthday is kept over a later one, so the birthday is set once", () => {
    expect.hasAssertions();

    expect(setTravelerBirthday(BIRTHDAY, LATER_BIRTHDAY)).toStrictEqual(BIRTHDAY);
  });

  test("a day past the end of its month is not set", () => {
    expect.hasAssertions();

    expect(setTravelerBirthday(undefined, NO_SUCH_DAY)).toBeUndefined();
  });

  test("the twenty-ninth of February is set, the save keeping no year", () => {
    expect.hasAssertions();

    expect(setTravelerBirthday(undefined, LEAP_DAY)).toStrictEqual(LEAP_DAY);
  });
});
