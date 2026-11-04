import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { describe, expect, test } from "vitest";

// The parser reads a date by its shape, so the date is the epoch's own year, and only the part under test moves from it
describe(parseSurveyLogicDate, () => {
  test.each([
    ["a date-only string is read at local midnight", "1970-01-02", new Date(1970, 0, 2)],
    ["a date and a time joined by a T is read as local time", "1970-01-02T10:30", new Date(1970, 0, 2, 10, 30)],
    ["a date and a time joined by a space is read as local time", "1970-01-02 10:30", new Date(1970, 0, 2, 10, 30)],
    [
      "seconds and a fraction of a second are read when they are given",
      "1970-01-02T10:30:15.250",
      new Date(1970, 0, 2, 10, 30, 15, 250),
    ],
    ["a zone of Z is read as the moment it names", "1970-01-02T10:30:00Z", new Date(Date.UTC(1970, 0, 2, 10, 30))],
    ["an offset is read as the moment it names", "1970-01-02T10:30:00+02:00", new Date(Date.UTC(1970, 0, 2, 8, 30))],
    ["a number is not a date", 0, undefined],
    ["an empty text is not a date", "", undefined],
    ["a day the month does not have is not a date", "1970-02-30", undefined],
    ["an hour past the twenty-fourth is not a date", "1970-01-02T24:00", undefined],
    ["a word after the date is not a date", "1970-01-02x", undefined],
    ["a leading space is not a date, as no text is trimmed", " 1970-01-02", undefined],
    ["an unanswered value is not a date", undefined, undefined],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(parseSurveyLogicDate(value)).toStrictEqual(expected);
  });
});
