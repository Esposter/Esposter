import { HOST_SCHEME } from "#src/services/constants";
import { checkIsSchemeLaunchTampered } from "#src/services/installer/checkIsSchemeLaunchTampered";
import { describe, expect, test } from "vitest";

describe(checkIsSchemeLaunchTampered, () => {
  const link = `${HOST_SCHEME}://start`;

  test.each([
    [[link], false],
    [["--port", "0"], false],
    [[], false],
    // A quote in the link closed the argument early, so what followed it arrived as flags of its own
    [[`${HOST_SCHEME}://start`, "--origin", "https://a"], true],
    [["--hostname", "0.0.0.0", link], true],
  ])("reads %j as tampered: %s", (commandLineArguments, expected) => {
    expect.hasAssertions();

    expect(checkIsSchemeLaunchTampered(commandLineArguments)).toBe(expected);
  });
});
