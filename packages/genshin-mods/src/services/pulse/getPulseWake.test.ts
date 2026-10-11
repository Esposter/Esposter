import { describe, expect, test } from "vitest";

import { IDLE_LINE_PREFIX } from "../constants";
import { getPulseWake } from "./getPulseWake";

describe(getPulseWake, () => {
  const IDLE_LINE = `${IDLE_LINE_PREFIX} cpu 12% - room for more runs`;
  const CLEAR_OPTIONS = { isTurnRunning: false, isWindDown: false };

  test("wakes on the line of the machine going idle", () => {
    expect.hasAssertions();

    expect(getPulseWake(IDLE_LINE, CLEAR_OPTIONS)).toBe(true);
  });

  test("does not wake on a line that is not the idle line", () => {
    expect.hasAssertions();

    expect(getPulseWake("machine busy: cpu 95%", CLEAR_OPTIONS)).toBe(false);
  });

  test("does not wake while a turn is running", () => {
    expect.hasAssertions();

    expect(getPulseWake(IDLE_LINE, { ...CLEAR_OPTIONS, isTurnRunning: true })).toBe(false);
  });

  test("does not wake while a usage reserve winds down", () => {
    expect.hasAssertions();

    expect(getPulseWake(IDLE_LINE, { ...CLEAR_OPTIONS, isWindDown: true })).toBe(false);
  });
});
