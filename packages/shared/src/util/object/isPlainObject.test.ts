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
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject("")).toBe(false);
    expect(isPlainObject(0)).toBe(false);
    expect(isPlainObject(Symbol(""))).toBe(false);
    expect(isPlainObject(() => {})).toBe(false);
    expect(isPlainObject(new RegExp(""))).toBe(false);
  });
});
