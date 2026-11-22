import { SYNTHETIC_MODEL } from "#src/services/usage/constants";
import { getUsageFamily } from "#src/services/usage/getUsageFamily";
import { describe, expect, test } from "vitest";

describe(getUsageFamily, () => {
  test.each([
    ["claude-opus-5-5", "opus"],
    ["claude-sonnet-5-5", "sonnet"],
    ["claude-haiku-5-5", "haiku"],
    ["claude-fable-5-1", "fable"],
    [SYNTHETIC_MODEL, SYNTHETIC_MODEL],
  ])("%s is the %s family", (model, family) => {
    expect.hasAssertions();

    expect(getUsageFamily(model)).toBe(family);
  });
});
