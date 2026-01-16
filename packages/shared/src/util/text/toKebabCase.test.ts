import { toKebabCase } from "@/util/text/toKebabCase";
import { describe, expect, test } from "vitest";

describe(toKebabCase, () => {
  test("basic case conversion", () => {
    expect.hasAssertions();

    expect(toKebabCase("a")).toBe("a");
    expect(toKebabCase("A")).toBe("a");
    expect(toKebabCase("aA")).toBe("a-a");
    expect(toKebabCase("Aa")).toBe("aa");
    expect(toKebabCase("aAa")).toBe("a-aa");
  });

  test("handling numbers", () => {
    expect.hasAssertions();

    expect(toKebabCase("0")).toBe("0");
    expect(toKebabCase("a0")).toBe("a0");
    expect(toKebabCase("a0A")).toBe("a0-a");
  });

  test("empty string", () => {
    expect.hasAssertions();

    expect(toKebabCase("")).toBe("");
  });
});
