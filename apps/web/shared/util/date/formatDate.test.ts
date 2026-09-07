import { formatDate } from "#shared/util/date/formatDate";
import { describe, expect, test } from "vitest";

describe(formatDate, () => {
  // A Tuesday, so every weekday and month token has a distinct answer, and an afternoon so the 12/24-hour
  // Tokens disagree. Built from local parts rather than an ISO string: the formatter answers in the reader's
  // Zone, so a UTC literal would move the expected text on every machine but one.
  const DATE = new Date(2026, 8, 1, 14, 3, 5);

  test.each([
    ["YYYY-MM-DD", "2026-09-01"],
    ["D/M/YYYY", "1/9/2026"],
    ["DD/MM/YYYY H:mm", "01/09/2026 14:03"],
    ["YYYY-MM-DDTHH:mm:ss", "2026-09-01T14:03:05"],
    ["YYYY-MM-DD HH:mm:ss", "2026-09-01 14:03:05"],
    ["YYYY-MM", "2026-09"],
    ["H:mm", "14:03"],
    ["h:mm A", "2:03 PM"],
    ["hh:mm A", "02:03 PM"],
    ["dddd, MMMM Do", "Tuesday, September 1st"],
    ["ddd, MMM D, YYYY h:mm A", "Tue, Sep 1, 2026 2:03 PM"],
  ])("writes %s", (format, expected) => {
    expect.hasAssertions();

    expect(formatDate(DATE, format)).toBe(expected);
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

    expect(formatDate(new Date(2026, 8, day), "Do")).toBe(expected);
  });
});
