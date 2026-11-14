import { checkIsUniqueViolation } from "#server/services/db/checkIsUniqueViolation";
import { describe, expect, test } from "vitest";

describe(checkIsUniqueViolation, () => {
  const uniqueViolation = new Error("D1_ERROR: UNIQUE constraint failed: invitesInMessage.id: SQLITE_CONSTRAINT");

  test.each([
    ["the driver's error", uniqueViolation, true],
    ["the query error wrapping it", new Error("Failed query: insert", { cause: uniqueViolation }), true],
    ["another constraint", new Error("D1_ERROR: NOT NULL constraint failed: invitesInMessage.id"), false],
    ["an error with no cause", new Error(" "), false],
    ["something that is not an error", "", false],
  ])("reads %s", (_name, error, expected) => {
    expect.hasAssertions();

    expect(checkIsUniqueViolation(error)).toBe(expected);
  });
});
