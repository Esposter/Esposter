import { prettify } from "@/util/text/prettify";
import { describe, expect, expectTypeOf, test } from "vitest";

describe("prettify type", () => {
  test("single character should be the same", () => {
    expect.hasAssertions();

    expectTypeOf(prettify("a")).toEqualTypeOf<"a">();
    expectTypeOf(prettify("A")).toEqualTypeOf<"A">();
    expectTypeOf(prettify("0")).toEqualTypeOf<"0">();
  });

  test("multiple same characters should be the same", () => {
    expect.hasAssertions();

    expectTypeOf(prettify("aa")).toEqualTypeOf<"aa">();
    expectTypeOf(prettify("AA")).toEqualTypeOf<"AA">();
    expectTypeOf(prettify("00")).toEqualTypeOf<"00">();
  });

  test("lowercase + uppercase/digit should have space in between", () => {
    expect.hasAssertions();

    expectTypeOf(prettify("aA")).toEqualTypeOf<"a A">();
    expectTypeOf(prettify("a0")).toEqualTypeOf<"a 0">();
  });

  test("digit + lowercase/uppercase should have space in between", () => {
    expect.hasAssertions();

    expectTypeOf(prettify("0a")).toEqualTypeOf<"0 a">();
    expectTypeOf(prettify("0A")).toEqualTypeOf<"0 A">();
  });
});
