import { isPalindrome } from "#shared/services/achievement/conditions/isPalindrome";
import { describe, expect, test } from "vitest";

describe(isPalindrome, () => {
  test("reads the letters and digits of a value, ignoring case and punctuation", () => {
    expect.hasAssertions();

    expect(isPalindrome("A, a")).toBe(true);
    expect(isPalindrome("ab")).toBe(false);
    expect(isPalindrome(undefined)).toBe(false);
  });
});
