import { AllSpecialValues } from "@/test/constants";
import { isPlainObject } from "@/util/object/isPlainObject";
import { describe, expect, test } from "vitest";

describe(isPlainObject, () => {
  test(isPlainObject, () => {
    expect.hasAssertions();

    for (const { isPlainObject: expected, value } of AllSpecialValues) expect(isPlainObject(value)).toBe(expected);
  });
});
