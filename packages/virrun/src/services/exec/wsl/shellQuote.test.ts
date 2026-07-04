import { shellQuote } from "@/services/exec/wsl/shellQuote";
import { describe, expect, test } from "vitest";

describe(shellQuote, () => {
  test("wraps in single quotes", () => {
    expect.hasAssertions();

    expect(shellQuote("a")).toBe("'a'");
  });

  test("suppresses expansion of shell metacharacters", () => {
    expect.hasAssertions();

    expect(shellQuote("$(a) `a` $a")).toBe("'$(a) `a` $a'");
  });

  test("closes, escapes, and reopens an embedded single quote", () => {
    expect.hasAssertions();

    expect(shellQuote("a'a")).toBe(`'a'\\''a'`);
  });
});
