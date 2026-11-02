import { formatDate } from "#shared/util/date/formatDate";
import { TIMELINE_DATE_FORMAT, TIMELINE_DATE_WITH_YEAR_FORMAT } from "@/util/date/constants";
import { getTimelineDateLabel } from "@/util/date/getTimelineDateLabel";
import { getZonedDateTime } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(getTimelineDateLabel, () => {
  // Today is the epoch's day, so a day of this year is the epoch plus a few days
  const epoch = new Date(0);
  const thisYearDate = new Date(getZonedDateTime(epoch).add({ days: 2 }).epochMilliseconds);
  // Twenty-eight years on keeps the weekday, month and day, so this date is the namesake of the one above
  const otherYearDate = new Date(getZonedDateTime(thisYearDate).add({ years: 28 }).epochMilliseconds);

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("heads a day of this year without its year", () => {
    expect.hasAssertions();

    expect(getTimelineDateLabel(thisYearDate)).toBe(formatDate(thisYearDate, TIMELINE_DATE_FORMAT));
  });

  test("heads a day of another year with its year, so it differs from its namesake this year", () => {
    expect.hasAssertions();

    expect(getTimelineDateLabel(otherYearDate)).toBe(formatDate(otherYearDate, TIMELINE_DATE_WITH_YEAR_FORMAT));
    expect(getTimelineDateLabel(otherYearDate)).not.toBe(getTimelineDateLabel(thisYearDate));
  });
});
