import { describe, expect, test } from "vitest";

import { pickTypeSafeKey } from "./pickTypeSafeKey";

describe(pickTypeSafeKey, () => {
  const OPTION_KEY = "option-key";
  const VARIABLE_KEY = "variable-key";

  test("the option's key wins over the variable's", () => {
    expect.hasAssertions();

    expect(pickTypeSafeKey(OPTION_KEY, VARIABLE_KEY)).toBe(OPTION_KEY);
  });

  test("a blank option falls back to the variable's key", () => {
    expect.hasAssertions();

    expect(pickTypeSafeKey("", VARIABLE_KEY)).toBe(VARIABLE_KEY);
  });

  test("no key when neither is set", () => {
    expect.hasAssertions();

    expect(pickTypeSafeKey("", undefined)).toBe("");
  });
});
