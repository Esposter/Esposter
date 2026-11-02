import { parseLooseDate } from "#shared/util/date/parseLooseDate";
import { describe, expect, test } from "vitest";

describe(parseLooseDate, () => {
  test.each([
    ["an ISO date whose day the calendar lacks", "1970-02-30"],
    ["an ISO datetime whose day the calendar lacks", "1970-02-30T00:00:00Z"],
    ["a bare number", "5"],
    ["a slashed date whose day the calendar lacks", "1970/02/30"],
    ["a named month's day it lacks", "Feb 30 1970"],
    ["a leap day in a year without one", "Feb 29 1970"],
    ["a leap day with no year, which the engine reads in a common one", "Feb 29"],
    ["a day-first named month's day it lacks", "31 Apr 1970"],
  ])("refuses %s rather than reading it forward", (_name, value) => {
    expect.hasAssertions();

    expect(parseLooseDate(value)).toBeUndefined();
  });

  test("reads an ISO datetime whose date exists to the instant it names", () => {
    expect.hasAssertions();

    expect(parseLooseDate(new Date(0).toISOString())).toStrictEqual(new Date(0));
  });

  test("reads a spaced ISO datetime with no letter in it, as the engine reads a leading date that exists", () => {
    expect.hasAssertions();

    const spacedEpoch = new Date(0).toISOString().slice(0, 16).replace("T", " ");

    expect(parseLooseDate(spacedEpoch)).toStrictEqual(new Date(1970, 0, 1));
  });

  test("reads text that names a month to the local date it names", () => {
    expect.hasAssertions();

    expect(parseLooseDate("Jan 1 1970")).toStrictEqual(new Date(1970, 0, 1));
  });

  test("reads a leap day in a leap year", () => {
    expect.hasAssertions();

    expect(parseLooseDate("Feb 29 1972")?.getDate()).toBe(29);
  });

  test("reads a time zone's day across a month's edge, since the text's own day exists", () => {
    expect.hasAssertions();

    expect(parseLooseDate("Jan 31 1970 23:30 GMT-0500")).toStrictEqual(new Date(Date.UTC(1970, 1, 1, 4, 30)));
  });
});
