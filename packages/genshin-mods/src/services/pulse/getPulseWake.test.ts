import { describe, expect, test } from "vitest";

import { IDLE_WAKE_MINUTES, IDLE_WAKE_REPEAT_MILLISECONDS, UTILIZATION_LINE_PERCENTAGE } from "../constants";
import { getPulseWake } from "./getPulseWake";

describe(getPulseWake, () => {
  const ONE_MINUTE_MILLISECONDS = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
  const WAKE_MILLISECONDS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
  const IDLE_STATE = { cpuPercentage: UTILIZATION_LINE_PERCENTAGE - 1, idleMinutes: IDLE_WAKE_MINUTES };
  const FIRST_WAKE_OPTIONS = { isTurnRunning: false, isWindDown: false, lastWakeMs: 0, nowMs: WAKE_MILLISECONDS };

  test("does not wake while the machine has been idle for under the wait", () => {
    expect.hasAssertions();

    expect(getPulseWake({ ...IDLE_STATE, idleMinutes: IDLE_WAKE_MINUTES - 1 }, FIRST_WAKE_OPTIONS)).toBe(false);
  });

  test("wakes once the machine has been idle for the wait", () => {
    expect.hasAssertions();

    expect(getPulseWake(IDLE_STATE, FIRST_WAKE_OPTIONS)).toBe(true);
  });

  test("does not wake while a turn is running", () => {
    expect.hasAssertions();

    expect(getPulseWake(IDLE_STATE, { ...FIRST_WAKE_OPTIONS, isTurnRunning: true })).toBe(false);
  });

  test("does not wake while a usage reserve winds down", () => {
    expect.hasAssertions();

    expect(getPulseWake(IDLE_STATE, { ...FIRST_WAKE_OPTIONS, isWindDown: true })).toBe(false);
  });

  test("does not repeat the wake within the repeat interval", () => {
    expect.hasAssertions();

    expect(
      getPulseWake(IDLE_STATE, {
        ...FIRST_WAKE_OPTIONS,
        lastWakeMs: WAKE_MILLISECONDS,
        nowMs: WAKE_MILLISECONDS + ONE_MINUTE_MILLISECONDS,
      }),
    ).toBe(false);
  });

  test("repeats the wake once the repeat interval has passed", () => {
    expect.hasAssertions();

    expect(
      getPulseWake(IDLE_STATE, {
        ...FIRST_WAKE_OPTIONS,
        lastWakeMs: WAKE_MILLISECONDS,
        nowMs: WAKE_MILLISECONDS + IDLE_WAKE_REPEAT_MILLISECONDS,
      }),
    ).toBe(true);
  });

  test("does not wake while the GPU is at or over the line", () => {
    expect.hasAssertions();

    expect(getPulseWake({ ...IDLE_STATE, gpuPercentage: UTILIZATION_LINE_PERCENTAGE }, FIRST_WAKE_OPTIONS)).toBe(false);
  });

  test("wakes with the GPU unread", () => {
    expect.hasAssertions();

    expect(getPulseWake(IDLE_STATE, FIRST_WAKE_OPTIONS)).toBe(true);
  });
});
