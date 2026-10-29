import { describe, expect, test } from "vitest";

import { FIVE_HOUR_MAINTENANCE_PERCENTAGE, MAINTENANCE_INSTRUCTION, PACE_FLOOR_PERCENTAGE } from "../constants";
import { formatResetsAt } from "./formatResetsAt";
import { reserveText } from "./reserveText";

describe(reserveText, () => {
  const resetsAt = new Date(0).toISOString();

  test("names the window, the line it has passed and its reset time in the reserve's note", () => {
    expect.hasAssertions();

    expect(
      reserveText({ isAheadOfPace: false, name: "five-hour", percentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE, resetsAt }),
    ).toBe(
      `Usage maintenance: the five-hour usage window has passed ${FIVE_HOUR_MAINTENANCE_PERCENTAGE}% and resets at ${formatResetsAt(resetsAt)}. ${MAINTENANCE_INSTRUCTION}`,
    );
  });

  test("names the pace a reserve entered ahead of an even pace was passed at", () => {
    expect.hasAssertions();

    expect(reserveText({ isAheadOfPace: true, name: "weekly", percentage: PACE_FLOOR_PERCENTAGE, resetsAt })).toBe(
      `Usage maintenance: the weekly usage window has passed ${PACE_FLOOR_PERCENTAGE}% ahead of an even pace and resets at ${formatResetsAt(resetsAt)}. ${MAINTENANCE_INSTRUCTION}`,
    );
  });
});
