import { describe, expect, test } from "vitest";

import {
  FIVE_HOUR_MAINTENANCE_PERCENTAGE,
  FIVE_HOUR_WINDOW_MS,
  PACE_FLOOR_PERCENTAGE,
  WEEKLY_MAINTENANCE_PERCENTAGE,
  WEEKLY_WINDOW_MS,
} from "../constants";
import { getReserveWindow } from "./getReserveWindow";

describe(getReserveWindow, () => {
  const now = 0;
  // Reset at the epoch, so the whole window has elapsed and no usage is ahead of pace
  const resetsAt = new Date(0).toISOString();

  test("leaves both windows unread while under their lines", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow(
        [
          { kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE - 1, resetsAt },
          { kind: "seven_day", percentUsed: WEEKLY_MAINTENANCE_PERCENTAGE - 1, resetsAt },
        ],
        now,
      ),
    ).toBeUndefined();
  });

  test("names the five-hour window at its maintenance line", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([{ kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE, resetsAt }], now),
    ).toStrictEqual({
      isAheadOfPace: false,
      name: "five-hour",
      percentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE,
      resetsAt,
    });
  });

  test("names the weekly window at its maintenance line", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([{ kind: "seven_day", percentUsed: WEEKLY_MAINTENANCE_PERCENTAGE, resetsAt }], now),
    ).toStrictEqual({ isAheadOfPace: false, name: "weekly", percentage: WEEKLY_MAINTENANCE_PERCENTAGE, resetsAt });
  });

  test("names the weekly window when only it has passed its maintenance line", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow(
        [
          { kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE - 1, resetsAt },
          { kind: "seven_day", percentUsed: WEEKLY_MAINTENANCE_PERCENTAGE, resetsAt },
        ],
        now,
      ),
    ).toStrictEqual({ isAheadOfPace: false, name: "weekly", percentage: WEEKLY_MAINTENANCE_PERCENTAGE, resetsAt });
  });

  test("names the five-hour window when both have passed their maintenance lines, though the weekly one is read first", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow(
        [
          { kind: "seven_day", percentUsed: WEEKLY_MAINTENANCE_PERCENTAGE, resetsAt },
          { kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE, resetsAt },
        ],
        now,
      ),
    ).toStrictEqual({
      isAheadOfPace: false,
      name: "five-hour",
      percentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE,
      resetsAt,
    });
  });

  test("skips a window past the line that gives no reset time", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([{ kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE }], now),
    ).toBeUndefined();
  });

  test("reads nothing when both windows are missing", () => {
    expect.hasAssertions();

    expect(getReserveWindow([], now)).toBeUndefined();
  });

  test("leaves a weekly window at the pace floor unread once more than half of it has elapsed", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow(
        [{ kind: "seven_day", percentUsed: PACE_FLOOR_PERCENTAGE, resetsAt: new Date(WEEKLY_WINDOW_MS).toISOString() }],
        WEEKLY_WINDOW_MS * 0.6,
      ),
    ).toBeUndefined();
  });

  test("names a weekly window at the pace floor as ahead of pace once less than half of it has elapsed", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow(
        [{ kind: "seven_day", percentUsed: PACE_FLOOR_PERCENTAGE, resetsAt: new Date(WEEKLY_WINDOW_MS).toISOString() }],
        WEEKLY_WINDOW_MS * 0.4,
      ),
    ).toStrictEqual({
      isAheadOfPace: true,
      name: "weekly",
      percentage: PACE_FLOOR_PERCENTAGE,
      resetsAt: new Date(WEEKLY_WINDOW_MS).toISOString(),
    });
  });

  test("leaves a window under the pace floor unread even when it is ahead of pace", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow(
        [
          {
            kind: "five_hour",
            percentUsed: PACE_FLOOR_PERCENTAGE - 1,
            resetsAt: new Date(FIVE_HOUR_WINDOW_MS).toISOString(),
          },
        ],
        now,
      ),
    ).toBeUndefined();
  });

  test("reads a window past its maintenance line as not ahead of pace even when it is", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow(
        [
          {
            kind: "five_hour",
            percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE,
            resetsAt: new Date(FIVE_HOUR_WINDOW_MS).toISOString(),
          },
        ],
        now,
      ),
    ).toStrictEqual({
      isAheadOfPace: false,
      name: "five-hour",
      percentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE,
      resetsAt: new Date(FIVE_HOUR_WINDOW_MS).toISOString(),
    });
  });
});
