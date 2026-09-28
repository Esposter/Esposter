import { HOST_SCHEME } from "#src/services/installer/constants";
import { getSchemeLaunch } from "#src/services/installer/getSchemeLaunch";
import { describe, expect, test } from "vitest";

describe(getSchemeLaunch, () => {
  const code = "code";

  test.each([
    [`${HOST_SCHEME}://pair?code=${code}`, { code }],
    [`${HOST_SCHEME}://start`, { code: "" }],
    ["https://a", undefined],
    ["", undefined],
  ])("reads %s", (argument, expected) => {
    expect.hasAssertions();

    expect(getSchemeLaunch(argument)).toStrictEqual(expected);
  });
});
