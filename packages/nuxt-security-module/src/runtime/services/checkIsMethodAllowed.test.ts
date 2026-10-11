import { describe, expect, test } from "vitest";

import { checkIsMethodAllowed } from "#src/runtime/services/checkIsMethodAllowed";

describe(checkIsMethodAllowed, () => {
  const METHODS = ["GET", "POST"];

  test("a listed method is allowed", () => {
    expect.hasAssertions();

    expect(checkIsMethodAllowed("POST", METHODS)).toBe(true);
  });

  test("an unlisted method is refused, and the comparison is case-sensitive as HTTP is", () => {
    expect.hasAssertions();

    expect(checkIsMethodAllowed("DELETE", METHODS)).toBe(false);
    expect(checkIsMethodAllowed("get", METHODS)).toBe(false);
  });
});
