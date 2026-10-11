import { describe, expect, test } from "vitest";

import {
  FIVE_HOUR_MAINTENANCE_PERCENTAGE,
  FIVE_HOUR_WIND_DOWN_PERCENTAGE,
  WEEKLY_WIND_DOWN_PERCENTAGE,
} from "../constants";
import { getReserveWindow } from "./getReserveWindow";

describe(getReserveWindow, () => {
  const resetsAt = new Date(0).toISOString();

  test("leaves both windows unread while under their lines", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([
        { kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE - 1, resetsAt },
        { kind: "seven_day", percentUsed: WEEKLY_WIND_DOWN_PERCENTAGE - 1, resetsAt },
      ]),
    ).toBeUndefined();
  });

  test("names the five-hour window at its maintenance line as maintenance", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([{ kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE, resetsAt }]),
    ).toStrictEqual({ isWindDown: false, name: "five-hour", percentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE, resetsAt });
  });

  test("names the five-hour window at its wind-down line as wind-down", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([{ kind: "five_hour", percentUsed: FIVE_HOUR_WIND_DOWN_PERCENTAGE, resetsAt }]),
    ).toStrictEqual({ isWindDown: true, name: "five-hour", percentage: FIVE_HOUR_WIND_DOWN_PERCENTAGE, resetsAt });
  });

  test("names the weekly window at its line as wind-down, since it has no maintenance tier", () => {
    expect.hasAssertions();

    expect(getReserveWindow([{ kind: "seven_day", percentUsed: WEEKLY_WIND_DOWN_PERCENTAGE, resetsAt }])).toStrictEqual(
      { isWindDown: true, name: "weekly", percentage: WEEKLY_WIND_DOWN_PERCENTAGE, resetsAt },
    );
  });

  test("names the weekly window when only it has passed its line", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([
        { kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE - 1, resetsAt },
        { kind: "seven_day", percentUsed: WEEKLY_WIND_DOWN_PERCENTAGE, resetsAt },
      ]),
    ).toStrictEqual({ isWindDown: true, name: "weekly", percentage: WEEKLY_WIND_DOWN_PERCENTAGE, resetsAt });
  });

  test("names the weekly wind-down over a five-hour maintenance tier, the stricter one", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([
        { kind: "seven_day", percentUsed: WEEKLY_WIND_DOWN_PERCENTAGE, resetsAt },
        { kind: "five_hour", percentUsed: FIVE_HOUR_MAINTENANCE_PERCENTAGE, resetsAt },
      ]),
    ).toStrictEqual({ isWindDown: true, name: "weekly", percentage: WEEKLY_WIND_DOWN_PERCENTAGE, resetsAt });
  });

  test("names the five-hour window when both are at wind-down", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([
        { kind: "seven_day", percentUsed: WEEKLY_WIND_DOWN_PERCENTAGE, resetsAt },
        { kind: "five_hour", percentUsed: FIVE_HOUR_WIND_DOWN_PERCENTAGE, resetsAt },
      ]),
    ).toStrictEqual({ isWindDown: true, name: "five-hour", percentage: FIVE_HOUR_WIND_DOWN_PERCENTAGE, resetsAt });
  });

  test("skips a window past the line that gives no reset time", () => {
    expect.hasAssertions();

    expect(getReserveWindow([{ kind: "five_hour", percentUsed: FIVE_HOUR_WIND_DOWN_PERCENTAGE }])).toBeUndefined();
  });

  test("reads nothing when both windows are missing", () => {
    expect.hasAssertions();

    expect(getReserveWindow([])).toBeUndefined();
  });
});
