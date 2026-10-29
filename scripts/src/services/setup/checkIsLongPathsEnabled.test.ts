import { checkIsLongPathsEnabled } from "#src/services/setup/checkIsLongPathsEnabled";
import { describe, expect, test } from "vitest";

describe(checkIsLongPathsEnabled, () => {
  test.each([
    ["LongPathsEnabled    REG_DWORD    0x1\r\n", true],
    ["LongPathsEnabled    REG_DWORD    0x0\r\n", false],
    ["LongPathsEnabled    REG_DWORD    0x10\r\n", false],
    [null, false],
  ])("reads the value in %j as enabled %s", (output, isEnabled) => {
    expect.hasAssertions();

    expect(checkIsLongPathsEnabled(output)).toBe(isEnabled);
  });
});
