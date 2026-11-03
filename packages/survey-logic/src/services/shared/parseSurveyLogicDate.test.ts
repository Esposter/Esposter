import { parseSurveyLogicDate } from "#src/services/shared/parseSurveyLogicDate";
import { describe, expect, test } from "vitest";

// The parser reads a date by its shape, so the date is the epoch's own year, and only the part under test moves from it
describe(parseSurveyLogicDate, () => {
  test.each([
    ["a date-only string is read at local midnight", "1970-01-02", new Date(1970, 0, 2)],
    ["a date and a time joined by a T is read as local time", "1970-01-02T10:30", new Date(1970, 0, 2, 10, 30)],
    [
      "a date and a time joined by a space is not cut down to its date",
      "1970-01-02 10:30",
      new Date(1970, 0, 2, 10, 30),
    ],
    [
      "a date and a time with seconds joined by a space keeps them",
      "1970-01-02 10:30:00",
      new Date(1970, 0, 2, 10, 30),
    ],
    ["a number is read as milliseconds from the epoch", 0, new Date(0)],
  ])("%s", (_title, value, expected) => {
    expect.hasAssertions();

    expect(parseSurveyLogicDate(value)).toStrictEqual(expected);
  });
});
