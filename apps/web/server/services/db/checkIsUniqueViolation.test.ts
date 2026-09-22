import { checkIsUniqueViolation } from "@@/server/services/db/checkIsUniqueViolation";
import { UNIQUE_VIOLATION_ERROR_CODE } from "@@/server/services/db/constants";
import { describe, expect, test } from "vitest";

describe(checkIsUniqueViolation, () => {
  const uniqueViolation = Object.assign(new Error(" "), { code: UNIQUE_VIOLATION_ERROR_CODE });

  test.each([
    ["the driver's error", uniqueViolation, true],
    ["the query error wrapping it", new Error(" ", { cause: uniqueViolation }), true],
    ["another code", Object.assign(new Error(" "), { code: "" }), false],
    ["an error with no code", new Error(" "), false],
    ["something that is not an error", "", false],
  ])("reads %s", (_name, error, expected) => {
    expect.hasAssertions();

    expect(checkIsUniqueViolation(error)).toBe(expected);
  });
});
