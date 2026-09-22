import { ALL_SPECIAL_VALUES } from "#src/test/constants";
import { checkIsPlainObject } from "#src/util/object/checkIsPlainObject";
import { describe, expect, test } from "vitest";

describe(checkIsPlainObject, () => {
  test(checkIsPlainObject, () => {
    expect.hasAssertions();

    for (const { isPlainObject: expected, value } of ALL_SPECIAL_VALUES)
      expect(checkIsPlainObject(value)).toBe(expected);
  });
});
