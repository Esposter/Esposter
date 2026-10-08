import { describe, expect, test } from "vitest";

import { USAGE_RESERVE_PERCENTAGE } from "../constants";
import { getReserveWindow } from "./getReserveWindow";

describe(getReserveWindow, () => {
  const resetsAt = new Date(0).toISOString();

  test("leaves both windows unread while under the line", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([
        { kind: "five_hour", percentUsed: USAGE_RESERVE_PERCENTAGE - 1, resetsAt },
        { kind: "seven_day", percentUsed: USAGE_RESERVE_PERCENTAGE - 1, resetsAt },
      ]),
    ).toBeUndefined();
  });

  test("names a window exactly at the line", () => {
    expect.hasAssertions();

    expect(getReserveWindow([{ kind: "five_hour", percentUsed: USAGE_RESERVE_PERCENTAGE, resetsAt }])).toStrictEqual({
      name: "five-hour",
      resetsAt,
    });
  });

  test("names the weekly window when only it has passed the line", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([
        { kind: "five_hour", percentUsed: USAGE_RESERVE_PERCENTAGE - 1, resetsAt },
        { kind: "seven_day", percentUsed: USAGE_RESERVE_PERCENTAGE, resetsAt },
      ]),
    ).toStrictEqual({ name: "weekly", resetsAt });
  });

  test("names the five-hour window when both have passed the line", () => {
    expect.hasAssertions();

    expect(
      getReserveWindow([
        { kind: "seven_day", percentUsed: USAGE_RESERVE_PERCENTAGE, resetsAt },
        { kind: "five_hour", percentUsed: USAGE_RESERVE_PERCENTAGE, resetsAt },
      ]),
    ).toStrictEqual({ name: "five-hour", resetsAt });
  });

  test("skips a window past the line that gives no reset time", () => {
    expect.hasAssertions();

    expect(getReserveWindow([{ kind: "five_hour", percentUsed: USAGE_RESERVE_PERCENTAGE }])).toBeUndefined();
  });

  test("reads nothing when both windows are missing", () => {
    expect.hasAssertions();

    expect(getReserveWindow([])).toBeUndefined();
  });
});
