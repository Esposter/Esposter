import { describe, expect, test } from "vitest";

import {
  FIVE_HOUR_MAINTENANCE_PERCENTAGE,
  FIVE_HOUR_WIND_DOWN_PERCENTAGE,
  MAINTENANCE_INSTRUCTION,
  PACE_FLOOR_PERCENTAGE,
  RESERVE_INSTRUCTION,
} from "../constants";
import { formatResetsAt } from "./formatResetsAt";
import { reserveText } from "./reserveText";

describe(reserveText, () => {
  const resetsAt = new Date(0).toISOString();

  test("names the window, the line it has passed and its reset time in the maintenance note", () => {
    expect.hasAssertions();

    expect(
      reserveText({
        isAheadOfPace: false,
        isWindDown: false,
        name: "five-hour",
        percentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE,
        resetsAt,
      }),
    ).toBe(
      `Usage maintenance: the five-hour usage window has passed ${FIVE_HOUR_MAINTENANCE_PERCENTAGE}% and resets at ${formatResetsAt(resetsAt)}. ${MAINTENANCE_INSTRUCTION}`,
    );
  });

  test("names the pace a maintenance tier entered ahead of an even pace was passed at", () => {
    expect.hasAssertions();

    expect(
      reserveText({
        isAheadOfPace: true,
        isWindDown: false,
        name: "weekly",
        percentage: PACE_FLOOR_PERCENTAGE,
        resetsAt,
      }),
    ).toBe(
      `Usage maintenance: the weekly usage window has passed ${PACE_FLOOR_PERCENTAGE}% ahead of an even pace and resets at ${formatResetsAt(resetsAt)}. ${MAINTENANCE_INSTRUCTION}`,
    );
  });

  test("keeps the wind-down note under the reserve's own instruction", () => {
    expect.hasAssertions();

    expect(
      reserveText({
        isAheadOfPace: false,
        isWindDown: true,
        name: "five-hour",
        percentage: FIVE_HOUR_WIND_DOWN_PERCENTAGE,
        resetsAt,
      }),
    ).toBe(
      `Usage reserve: the five-hour usage window has passed ${FIVE_HOUR_WIND_DOWN_PERCENTAGE}% and resets at ${formatResetsAt(resetsAt)}. ${RESERVE_INSTRUCTION}`,
    );
  });
});
