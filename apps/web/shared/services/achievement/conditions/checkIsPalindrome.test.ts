import { checkIsPalindrome } from "#shared/services/achievement/conditions/checkIsPalindrome";
import { describe, expect, test } from "vitest";

describe(checkIsPalindrome, () => {
  test("reads the letters and digits of a value, ignoring case and punctuation", () => {
    expect.hasAssertions();

    expect(checkIsPalindrome("A, a")).toBe(true);
    expect(checkIsPalindrome("ab")).toBe(false);
    expect(checkIsPalindrome(undefined)).toBe(false);
  });

  test("a message with no letter or digit, or only one, is no palindrome", () => {
    expect.hasAssertions();

    expect(checkIsPalindrome("🙂🙂")).toBe(false);
    expect(checkIsPalindrome("!?")).toBe(false);
    expect(checkIsPalindrome("a")).toBe(false);
  });

  test("reads every script's letters, an accented letter whole", () => {
    expect.hasAssertions();

    expect(checkIsPalindrome("日本日")).toBe(true);
    expect(checkIsPalindrome("日本")).toBe(false);
    expect(checkIsPalindrome("été")).toBe(true);
  });
});
