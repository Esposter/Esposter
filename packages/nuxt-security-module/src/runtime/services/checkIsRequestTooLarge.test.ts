import { checkIsRequestTooLarge } from "#src/runtime/services/checkIsRequestTooLarge";
import { describe, expect, test } from "vitest";

describe(checkIsRequestTooLarge, () => {
  const LIMITS = { maxRequestSizeInBytes: 10 };

  test("a request over its limit is too large, and one at it is not", () => {
    expect.hasAssertions();

    expect(checkIsRequestTooLarge("POST", "10", LIMITS)).toBe(false);
    expect(checkIsRequestTooLarge("POST", "11", LIMITS)).toBe(true);
  });

  test("a method that carries no body is never measured", () => {
    expect.hasAssertions();

    expect(checkIsRequestTooLarge("GET", "100", LIMITS)).toBe(false);
  });

  test("a PATCH carries a body, so it is measured as a POST is", () => {
    expect.hasAssertions();

    expect(checkIsRequestTooLarge("PATCH", "11", LIMITS)).toBe(true);
  });

  test("a request with no declared length is left to the count its body is read through", () => {
    expect.hasAssertions();

    expect(checkIsRequestTooLarge("POST", null, LIMITS)).toBe(false);
  });
});
