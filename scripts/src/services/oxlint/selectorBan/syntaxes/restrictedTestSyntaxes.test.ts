import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_TEST_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedTestSyntaxes";
import { describe } from "vitest";

const createClockFixture = (name: string, statement: string, violations: number) => ({
  filePath: "a.test.ts",
  name,
  source: `import { vi } from "vitest";\n${statement}`,
  violations,
});

const createTimeoutFixture = (name: string, statement: string, violations: number) => ({
  filePath: "a.test.ts",
  name,
  source: `import { test } from "vitest";\n${statement}`,
  violations,
});

describe("restrictedTestSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_TEST_SYNTAXES.bans,
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
      createTimeoutFixture("timeoutThirdArgumentLiteral", 'test("slow", () => {}, 60_000);', 1),
      createTimeoutFixture("timeoutOptionLiteral", 'test("slow", { timeout: 60_000 }, () => {});', 1),
      createTimeoutFixture("timeoutNamedConstant", 'test("slow", { timeout: SLOW_MS }, () => {});', 0),
      createTimeoutFixture("timeoutAbsent", 'test("slow", () => {});', 0),
    ],
  });
});
