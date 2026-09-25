import { checkIsTokenValid } from "#src/services/server/checkIsTokenValid";
import { describe, expect, test } from "vitest";

describe(checkIsTokenValid, () => {
  const token = "token";

  test.each([
    [token, token, true],
    ["", token, false],
    [`${token} `, token, false],
    ["", "", false],
  ])("checks %j against %j", (candidate, expectedToken, expected) => {
    expect.hasAssertions();

    expect(checkIsTokenValid(candidate, expectedToken)).toBe(expected);
  });
});
