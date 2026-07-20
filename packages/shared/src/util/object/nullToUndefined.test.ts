import { nullToUndefined } from "@/util/object/nullToUndefined";
import { describe, expect, test } from "vitest";

describe(nullToUndefined, () => {
  test("converts a top-level null", () => {
    expect.hasAssertions();

    // oxlint-disable-next-line typescript/no-confusing-void-expression -- NullToUndefined<null> resolves to undefined, not void
    expect(nullToUndefined(null)).toBeUndefined();
  });

  test("preserves non-null primitives", () => {
    expect.hasAssertions();

    expect(nullToUndefined("")).toBe("");
    expect(nullToUndefined(0)).toBe(0);
    expect(nullToUndefined(false)).toBe(false);
  });

  test("preserves dates", () => {
    expect.hasAssertions();

    const date = new Date(0);
    expect(nullToUndefined(date)).toBe(date);
  });

  test("converts nulls in a row object without touching other fields", () => {
    expect.hasAssertions();

    expect(nullToUndefined({ deletedAt: null, id: "a", name: null })).toStrictEqual({
      deletedAt: undefined,
      id: "a",
      name: undefined,
    });
  });

  test("converts nulls nested in objects and arrays", () => {
    expect.hasAssertions();

    expect(nullToUndefined({ items: [{ value: null }, { value: 1 }] })).toStrictEqual({
      items: [{ value: undefined }, { value: 1 }],
    });
  });
});
