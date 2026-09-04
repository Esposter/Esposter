import { DEAD_PID } from "#src/services/exec/test/constants.test";
import { checkIsProcessAlive } from "#src/services/exec/util/checkIsProcessAlive";
import { describe, expect, test } from "vitest";

describe(checkIsProcessAlive, () => {
  test(`the current process reads as alive`, () => {
    expect.hasAssertions();

    expect(checkIsProcessAlive(process.pid)).toBe(true);
  });

  test(`a free pid reads as dead`, () => {
    expect.hasAssertions();

    expect(checkIsProcessAlive(DEAD_PID)).toBe(false);
  });

  test(`a non-positive pid reads as dead without throwing`, () => {
    expect.hasAssertions();

    expect(checkIsProcessAlive(0)).toBe(false);
    expect(checkIsProcessAlive(-1)).toBe(false);
  });
});
