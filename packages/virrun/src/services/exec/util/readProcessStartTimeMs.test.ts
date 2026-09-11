import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { readProcessStartTimeMs } from "#src/services/exec/util/readProcessStartTimeMs";
import { describe, expect, test } from "vitest";

// A real probe of the platform this suite runs on: the OS's answer for this process against node's own uptime.
// Linux boot time is whole seconds and the tick is 10ms, so the two agree to within a couple of seconds.
describe(readProcessStartTimeMs, () => {
  test("reads this process's start from the OS to within seconds of its uptime", () => {
    expect.hasAssertions();

    const startTimeMs = readProcessStartTimeMs(process.pid);

    expect(Math.abs((startTimeMs ?? 0) - (Date.now() - process.uptime() * 1000))).toBeLessThan(3000);
  });

  test("returns undefined for a pid nothing holds", () => {
    expect.hasAssertions();

    expect(readProcessStartTimeMs(DEAD_PID)).toBeUndefined();
  });
});
