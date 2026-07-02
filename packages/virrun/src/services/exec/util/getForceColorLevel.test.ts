import { getForceColorLevel } from "@/services/exec/util/getForceColorLevel";
import { describe, expect, test } from "vitest";

describe(getForceColorLevel, () => {
  test(`maps truecolor depth to level 3`, () => {
    expect.hasAssertions();

    expect(getForceColorLevel(24)).toBe("3");
  });

  test(`maps 256-color depth to level 2`, () => {
    expect.hasAssertions();

    expect(getForceColorLevel(8)).toBe("2");
  });

  test(`maps 16-color depth to level 1`, () => {
    expect.hasAssertions();

    expect(getForceColorLevel(4)).toBe("1");
  });

  test(`maps a no-color depth to level 1`, () => {
    expect.hasAssertions();

    expect(getForceColorLevel(1)).toBe("1");
  });
});
