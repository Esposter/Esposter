import { describe, expect, test } from "vitest";

import { checkIsBasicAuthorized } from "#src/runtime/services/checkIsBasicAuthorized";

describe(checkIsBasicAuthorized, () => {
  const OPTIONS = { name: "user", pass: "pass" };

  test("the configured name and password authorise the request", () => {
    expect.hasAssertions();

    expect(checkIsBasicAuthorized(`Basic ${btoa("user:pass")}`, OPTIONS)).toBe(true);
  });

  test("a wrong password does not authorise the request", () => {
    expect.hasAssertions();

    expect(checkIsBasicAuthorized(`Basic ${btoa("user:wrong")}`, OPTIONS)).toBe(false);
  });

  test("a request without an authorization header is not authorised", () => {
    expect.hasAssertions();

    expect(checkIsBasicAuthorized(null, OPTIONS)).toBe(false);
  });
});
