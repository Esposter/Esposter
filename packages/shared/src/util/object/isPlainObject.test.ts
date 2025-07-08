import { isPlainObject } from "@/util/object/isPlainObject";
import { describe, expect, test } from "vitest";

describe(isPlainObject, () => {
  test(isPlainObject, () => {
    expect.hasAssertions();

    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    // oxlint-disable-next-line no-useless-undefined
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject("string")).toBe(false);
    expect(isPlainObject(123)).toBe(false);
    expect(isPlainObject(Symbol(""))).toBe(false);
  });
});
