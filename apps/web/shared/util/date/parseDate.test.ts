import { DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { formatDate } from "#shared/util/date/formatDate";
import { parseDate } from "#shared/util/date/parseDate";
import { assert, describe, expect, test } from "vitest";

describe(parseDate, () => {
  const epoch = new Date(0);

  test("reads a value written in the same format back to the instant it names", () => {
    expect.hasAssertions();

    expect(parseDate("1970-01-01", "YYYY-MM-DD")).toStrictEqual(new Date(1970, 0, 1));
  });

  test("reads the offset a value carries rather than the reader's own", () => {
    expect.hasAssertions();

    expect(parseDate("1970-01-01T00:00:00+00:00", "YYYY-MM-DDTHH:mm:ssZ")).toStrictEqual(new Date(0));
  });

  test.each([
    ["a month the calendar does not have", "1970-13-01", "YYYY-MM-DD"],
    ["a day the month does not have", "1970-02-30", "YYYY-MM-DD"],
    ["an unpadded part where the format pads", "1970-1-1", "YYYY-MM-DD"],
    ["anything trailing the value", "1970-01-01T00:00:00", "YYYY-MM-DD"],
    ["a value written in another format", "01/01/1970", "YYYY-MM-DD"],
  ])("rejects %s", (_name, value, format) => {
    expect.hasAssertions();

    expect(parseDate(value, format)).toBeUndefined();
  });

  test("refuses a format it could never read back", () => {
    expect.hasAssertions();

    expect(() => parseDate("", "dddd")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseDate, "dddd" is a display-only format]`,
    );
  });

  test.each(DateFormats)("round-trips %s", (format) => {
    expect.hasAssertions();

    const formatted = formatDate(epoch, format);
    const date = parseDate(formatted, format);
    assert.exists(date);

    expect(formatDate(date, format)).toBe(formatted);
  });
});
