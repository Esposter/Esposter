import { describe, expect, test } from "vitest";

import {
  FIVE_HOUR_MAINTENANCE_PERCENTAGE,
  FIVE_HOUR_WIND_DOWN_PERCENTAGE,
  MAINTENANCE_INSTRUCTION,
  RESERVE_INSTRUCTION,
} from "../constants";
import { formatResetsAt } from "./formatResetsAt";
import { reserveText } from "./reserveText";

describe(reserveText, () => {
  const resetsAt = new Date(0).toISOString();

  test("names the window, the line it has passed and its reset time in the maintenance note", () => {
    expect.hasAssertions();

    expect(
      reserveText({ isWindDown: false, name: "five-hour", percentage: FIVE_HOUR_MAINTENANCE_PERCENTAGE, resetsAt }),
    ).toStrictEqual(
      `Usage maintenance: the five-hour usage window has passed ${FIVE_HOUR_MAINTENANCE_PERCENTAGE}% and resets at ${formatResetsAt(resetsAt)}. ${MAINTENANCE_INSTRUCTION}`,
    );
  });

  test("keeps the wind-down note under the reserve's own instruction", () => {
    expect.hasAssertions();

    expect(
      reserveText({ isWindDown: true, name: "five-hour", percentage: FIVE_HOUR_WIND_DOWN_PERCENTAGE, resetsAt }),
    ).toStrictEqual(
      `Usage reserve: the five-hour usage window has passed ${FIVE_HOUR_WIND_DOWN_PERCENTAGE}% and resets at ${formatResetsAt(resetsAt)}. ${RESERVE_INSTRUCTION}`,
    );
  });
});
