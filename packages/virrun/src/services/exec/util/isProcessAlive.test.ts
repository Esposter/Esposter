import { DEAD_PID } from "@/services/exec/test/constants.test";
import { isProcessAlive } from "@/services/exec/util/isProcessAlive";
import { describe, expect, test } from "vitest";

describe(isProcessAlive, () => {
  test(`the current process reads as alive`, () => {
    expect.hasAssertions();

    expect(isProcessAlive(process.pid)).toBe(true);
  });

  test(`a free pid reads as dead`, () => {
    expect.hasAssertions();

    expect(isProcessAlive(DEAD_PID)).toBe(false);
  });

  test(`a non-positive pid reads as dead without throwing`, () => {
    expect.hasAssertions();

    expect(isProcessAlive(0)).toBe(false);
    expect(isProcessAlive(-1)).toBe(false);
  });
});
