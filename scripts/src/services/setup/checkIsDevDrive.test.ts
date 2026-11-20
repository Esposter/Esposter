import { checkIsDevDrive } from "#src/services/setup/checkIsDevDrive";
import { describe, expect, test } from "vitest";

describe(checkIsDevDrive, () => {
  test.each([
    ["This is a trusted developer volume.\r\n", true],
    ["This is a developer volume.\r\n", true],
    ["This is not a developer volume.\r\n", false],
    [null, false],
  ])("reads %j as a Dev Drive %s", (output, isDevDrive) => {
    expect.hasAssertions();

    expect(checkIsDevDrive(output)).toBe(isDevDrive);
  });
});
