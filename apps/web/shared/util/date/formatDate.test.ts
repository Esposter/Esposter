import { formatDate } from "#shared/util/date/formatDate";
import { describe, expect, test } from "vitest";

describe(formatDate, () => {
  // The least value of each part that tells its tokens apart, the rest zero: the epoch's second day so D is not
  // M, the first afternoon hour so H is not h and h is not hh. Local parts, because the formatter answers in the
  // Reader's zone, so a UTC instant would move the expected text on every machine but one.
  const date = new Date(1970, 0, 2, 13);

  test.each([
    ["YYYY-MM-DD", "1970-01-02"],
    ["D/M/YYYY", "2/1/1970"],
    ["DD/MM/YYYY H:mm", "02/01/1970 13:00"],
    ["YYYY-MM-DDTHH:mm:ss", "1970-01-02T13:00:00"],
    ["YYYY-MM-DD HH:mm:ss", "1970-01-02 13:00:00"],
    ["YYYY-MM", "1970-01"],
    ["H:mm", "13:00"],
    ["h:mm A", "1:00 PM"],
    ["hh:mm A", "01:00 PM"],
    ["dddd, MMMM Do", "Friday, January 2nd"],
    ["ddd, MMM D, YYYY h:mm A", "Fri, Jan 2, 1970 1:00 PM"],
  ])("writes %s", (format, expected) => {
    expect.hasAssertions();

    expect(formatDate(date, format)).toBe(expected);
  });

  test.each([
    [1, "1st"],
    [2, "2nd"],
    [3, "3rd"],
    [4, "4th"],
    [11, "11th"],
    [21, "21st"],
  ])("ordinalises day %i as %s", (day, expected) => {
    expect.hasAssertions();

    expect(formatDate(new Date(1970, 0, day), "Do")).toBe(expected);
  });
});
