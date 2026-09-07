import { DateFormats } from "#shared/models/resource/sheet/column/DateFormat";
import { formatDate } from "#shared/util/date/formatDate";
import { parseDate } from "#shared/util/date/parseDate";
import { assert, describe, expect, test } from "vitest";

describe(parseDate, () => {
  const DATE = new Date(2026, 8, 1, 14, 3, 5);

  test("reads a value written in the same format back to the instant it names", () => {
    expect.hasAssertions();

    expect(parseDate("2026-09-01", "YYYY-MM-DD")).toStrictEqual(new Date(2026, 8, 1));
  });

  test("reads the offset a value carries rather than the reader's own", () => {
    expect.hasAssertions();

    expect(parseDate("2026-09-01T00:00:00+00:00", "YYYY-MM-DDTHH:mm:ssZ")).toStrictEqual(
      new Date(Date.UTC(2026, 8, 1)),
    );
  });

  test.each([
    ["a month the calendar does not have", "2026-13-01", "YYYY-MM-DD"],
    ["a day the month does not have", "2026-02-31", "YYYY-MM-DD"],
    ["an unpadded part where the format pads", "2026-9-1", "YYYY-MM-DD"],
    ["anything trailing the value", "2026-09-01T00:00:00", "YYYY-MM-DD"],
    ["a value written in another format", "01/09/2026", "YYYY-MM-DD"],
  ])("rejects %s", (_name, value, format) => {
    expect.hasAssertions();

    expect(parseDate(value, format)).toBeUndefined();
  });

  test("refuses a format it could never read back", () => {
    expect.hasAssertions();

    expect(() => parseDate("Tuesday", "dddd")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: parseDate, "dddd" is a display-only format]`,
    );
  });

  test.each(DateFormats)("round-trips %s", (format) => {
    expect.hasAssertions();

    const formatted = formatDate(DATE, format);
    const parsed = parseDate(formatted, format);
    assert.exists(parsed);

    expect(formatDate(parsed, format)).toBe(formatted);
  });
});
