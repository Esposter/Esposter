import { getBirthdayDayCount } from "#src/services/profile/getBirthdayDayCount";
import { describe, expect, test } from "vitest";

describe(getBirthdayDayCount, () => {
  test.each<[string, number, number]>([
    ["february has twenty-nine days, the save keeping no year", 2, 29],
    ["april has thirty days", 4, 30],
    ["june has thirty days", 6, 30],
    ["september has thirty days", 9, 30],
    ["november has thirty days", 11, 30],
    ["january has thirty-one days", 1, 31],
    ["october has thirty-one days", 10, 31],
  ])("%s", (_title, month, dayCount) => {
    expect.hasAssertions();

    expect(getBirthdayDayCount(month)).toBe(dayCount);
  });
});
