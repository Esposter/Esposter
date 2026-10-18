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

const createCountdown = (endsAt: string, endText = TEST_LABEL) => ({
  props: { endText, endsAt, id: TEST_ID },
  type: WebpageNodeType.Countdown,
});

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

    expect(serializeHtml([countdownNodeType.render(createCountdown(endsAt))]).split(">")[0]).toStrictEqual(
      `<div class="countdown" role="timer" aria-live="off" aria-atomic="false" data-ends-at="${endsAt}" data-end-text="${TEST_LABEL}"`,
    );
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
