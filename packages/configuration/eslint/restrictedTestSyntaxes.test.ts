import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedTestSyntaxes from "@esposter/configuration/eslint/restrictedTestSyntaxes.js";
import { describe } from "vitest";

const createClockFixture = (name: string, statement: string, violations: number) => ({
  filePath: "a.test.ts",
  name,
  source: `import { vi } from "vitest";\n${statement}`,
  violations,
});

describe("restrictedTestSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedTestSyntaxes,
    fixtures: [
      createClockFixture("setSystemTimeCount", "vi.setSystemTime(1);", 1),
      createClockFixture("setSystemTimeDate", "vi.setSystemTime(new Date(0));", 1),
      createClockFixture("setSystemTimeNegative", "vi.setSystemTime(-1);", 1),
      createClockFixture("setSystemTimeArithmetic", "vi.setSystemTime(a * b);", 1),
      createClockFixture("setSystemTimeTotal", 'vi.setSystemTime(duration.total("milliseconds"));', 1),
      createClockFixture("setSystemTimeEpochMilliseconds", "vi.setSystemTime(instant.epochMilliseconds);", 1),
      createClockFixture("setSystemTimeInstant", "vi.setSystemTime(Temporal.Instant.fromEpochMilliseconds(1));", 0),
      createClockFixture("setSystemTimeIdentifier", "vi.setSystemTime(instant);", 0),
      createClockFixture("fakeTimersNowCount", "vi.useFakeTimers({ now: 1 });", 1),
      createClockFixture("fakeTimersNowDate", "vi.useFakeTimers({ now: new Date(0) });", 1),
      createClockFixture("fakeTimersNowNegative", "vi.useFakeTimers({ now: -1 });", 1),
      createClockFixture("fakeTimersNowEpochMilliseconds", "vi.useFakeTimers({ now: instant.epochMilliseconds });", 1),
      createClockFixture("fakeTimersNowEpoch", "vi.useFakeTimers({ now: 0 });", 0),
      createClockFixture(
        "fakeTimersNowInstant",
        "vi.useFakeTimers({ now: Temporal.Instant.fromEpochMilliseconds(1) });",
        0,
      ),
      createClockFixture("fakeTimersNowAbsent", 'vi.useFakeTimers({ toFake: ["Date"] });', 0),
    ],
  });
});
