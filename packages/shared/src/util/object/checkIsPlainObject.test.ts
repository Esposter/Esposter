import { AllSpecialValues } from "@/test/constants";
import { checkIsPlainObject } from "@/util/object/checkIsPlainObject";
import { describe, expect, test } from "vitest";

describe(checkIsPlainObject, () => {
  test(checkIsPlainObject, () => {
    expect.hasAssertions();

    for (const { isPlainObject: expected, value } of AllSpecialValues) expect(checkIsPlainObject(value)).toBe(expected);
  });
});
