import { LoginTimeOfDay } from "#src/models/login/LoginTimeOfDay";
import { getLoginTimeOfDay } from "#src/services/login/getLoginTimeOfDay";
import { describe, expect, test } from "vitest";

describe(getLoginTimeOfDay, () => {
  test.each([
    ["04:29", LoginTimeOfDay.Night],
    ["04:30", LoginTimeOfDay.Dawn],
    ["08:00", LoginTimeOfDay.Day],
    ["17:00", LoginTimeOfDay.Dusk],
    ["19:00", LoginTimeOfDay.Night],
  ])("shows %s under the %s sky", (time, timeOfDay) => {
    expect.hasAssertions();

    expect(getLoginTimeOfDay(Temporal.PlainTime.from(time))).toBe(timeOfDay);
  });
});
