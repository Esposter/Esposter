// @vitest-environment happy-dom
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
import { countdownNodeType } from "#shared/services/pageBuilder/countdownNodeType";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { afterEach, describe, expect, test, vi } from "vitest";

// Local midnight a number of days after the epoch, so every test date is computed and never typed
const localDayFromEpoch = (days: number) => {
  const day = new Date(0);
  day.setDate(day.getDate() + days);
  day.setHours(0, 0, 0, 0);
  return day;
};

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Date reads a year from 0 to 99 as 1900 to 1999, so the year is set on the epoch rather than given to it
const endsAtOf = (year: number, month: number, day: number) => {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  return date.toISOString().slice(0, 10);
};

const createCountdown = (endsAt: string, endText = TEST_LABEL) => ({
  props: { endsAt, endText, id: TEST_ID },
  type: WebpageNodeType.Countdown,
});

// Whether a countdown's stored end date is accepted, so a test names a value by its text
const isAcceptedEndsAt = (endsAt: string) =>
  countdownNodeType.propsSchema.safeParse(createCountdown(endsAt).props).success;

// Mounts a countdown as the page does: its markup in the document, then its script run over the page
const mountCountdown = (endsAt: string, endText?: string) => {
  document.body.innerHTML = serializeHtml([countdownNodeType.render(createCountdown(endsAt, endText))]);
  countdownNodeType.script?.();
};

const readDigits = () =>
  ["day", "hour", "minute", "second"].map(
    (unit) => document.querySelector(`[data-unit="${unit}"] .countdown-value`)?.textContent,
  );

describe("countdownNodeType", () => {
  afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  test("a countdown does not announce each tick", () => {
    expect.hasAssertions();

    const endsAt = toDateInput(localDayFromEpoch(1));

    expect(serializeHtml([countdownNodeType.render(createCountdown(endsAt))])).toStrictEqual(
      `<div aria-atomic="false" aria-live="off" class="countdown" data-end-text="${TEST_LABEL}" data-ends-at="${endsAt}" role="timer"><span class="countdown-unit" data-unit="day"><span class="countdown-value"></span> days</span><span class="countdown-unit" data-unit="hour"><span class="countdown-value"></span> hours</span><span class="countdown-unit" data-unit="minute"><span class="countdown-value"></span> minutes</span><span class="countdown-unit" data-unit="second"><span class="countdown-value"></span> seconds</span><span class="countdown-end" hidden=""></span></div>`,
    );
  });

  test("a countdown refuses a date and time that is not on the calendar", () => {
    expect.hasAssertions();

    expect(["1970-02-31", "1970-13-01", "1970-02-28T24:00"].map((endsAt) => isAcceptedEndsAt(endsAt))).toStrictEqual([
      false,
      false,
      false,
    ]);
    expect(isAcceptedEndsAt("1970-02-28T23:59")).toBe(true);
  });

  test("a countdown accepts a real date in a year before 100", () => {
    expect.hasAssertions();

    expect([endsAtOf(50, 0, 1), endsAtOf(0, 1, 29)].map((endsAt) => isAcceptedEndsAt(endsAt))).toStrictEqual([
      true,
      true,
    ]);
  });

  test("a countdown reads a date-only value as local midnight", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    vi.setSystemTime(localDayFromEpoch(0));
    mountCountdown(toDateInput(localDayFromEpoch(1)));

    expect(readDigits()).toStrictEqual(["01", "00", "00", "00"]);
  });

  test("an end text is written as text, never as markup", () => {
    expect.hasAssertions();

    const endText = "<b>Closed</b>";
    vi.useFakeTimers();
    vi.setSystemTime(localDayFromEpoch(2));
    mountCountdown(toDateInput(localDayFromEpoch(1)), endText);

    expect({
      bold: document.querySelector("b"),
      text: document.querySelector(".countdown-end")?.textContent,
    }).toStrictEqual({ bold: null, text: endText });
  });

  test("a countdown whose element left the page stops its own timer", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    vi.setSystemTime(localDayFromEpoch(0));
    mountCountdown(toDateInput(localDayFromEpoch(1)));
    document.body.innerHTML = "";
    vi.advanceTimersByTime(1000);

    expect(vi.getTimerCount()).toBe(0);
  });
});
