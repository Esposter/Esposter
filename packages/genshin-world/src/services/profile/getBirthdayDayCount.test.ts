import { getBirthdayDayCount } from "#src/services/profile/getBirthdayDayCount";
import { describe, expect, test } from "vitest";

describe(getBirthdayDayCount, () => {
  test("february has twenty-nine days, the save keeping no year", () => {
    expect.hasAssertions();

    expect(getBirthdayDayCount(2)).toBe(29);
  });

  test("april has thirty days", () => {
    expect.hasAssertions();

    expect(getBirthdayDayCount(4)).toBe(30);
  });

  test("june has thirty days", () => {
    expect.hasAssertions();

    expect(getBirthdayDayCount(6)).toBe(30);
  });

  test("september has thirty days", () => {
    expect.hasAssertions();

    expect(getBirthdayDayCount(9)).toBe(30);
  });

  test("november has thirty days", () => {
    expect.hasAssertions();

    expect(getBirthdayDayCount(11)).toBe(30);
  });

  test("january has thirty-one days", () => {
    expect.hasAssertions();

    expect(getBirthdayDayCount(1)).toBe(31);
  });

  test("october has thirty-one days", () => {
    expect.hasAssertions();

    expect(getBirthdayDayCount(10)).toBe(31);
  });
});
