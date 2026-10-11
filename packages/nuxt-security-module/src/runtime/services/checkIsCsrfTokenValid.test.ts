import { checkIsCsrfTokenValid } from "#src/runtime/services/checkIsCsrfTokenValid";
import { describe, expect, test } from "vitest";

describe(checkIsCsrfTokenValid, () => {
  const TOKEN = "dG9rZW4tYS12YWx1ZQ==";

  test("a header that repeats the cookie is valid", () => {
    expect.hasAssertions();

    expect(checkIsCsrfTokenValid(TOKEN, TOKEN)).toBe(true);
  });

  test("a request with no header is refused, so a cross-site form cannot send one", () => {
    expect.hasAssertions();

    expect(checkIsCsrfTokenValid(TOKEN, null)).toBe(false);
  });

  test("a request whose cookie is missing is refused, even when its header is set", () => {
    expect.hasAssertions();

    expect(checkIsCsrfTokenValid(undefined, TOKEN)).toBe(false);
  });

  test("a header that differs from the cookie is refused", () => {
    expect.hasAssertions();

    expect(checkIsCsrfTokenValid(TOKEN, "dG9rZW4tYi12YWx1ZQ==")).toBe(false);
  });
});
