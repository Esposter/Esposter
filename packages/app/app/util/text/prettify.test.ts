import { prettify } from "@/util/text/prettify";
import { describe, expect, test } from "vitest";

describe("prettify", () => {
  test("single character should be the same", () => {
    expect.hasAssertions();

    expect(prettify("a")).toBe("a");
    expect(prettify("A")).toBe("A");
    expect(prettify("0")).toBe("0");
  });

  test("multiple same characters should be the same", () => {
    expect.hasAssertions();

    expect(prettify("aa")).toBe("aa");
    expect(prettify("AA")).toBe("AA");
    expect(prettify("00")).toBe("00");
  });

  test("lowercase + uppercase/digit should have space in between", () => {
    expect.hasAssertions();

    expect(prettify("aA")).toBe("a A");
    expect(prettify("a0")).toBe("a 0");
  });

  test("digit + lowercase/uppercase should have space in between", () => {
    expect.hasAssertions();

    expect(prettify("0a")).toBe("0 a");
    expect(prettify("0A")).toBe("0 A");
  });
});
