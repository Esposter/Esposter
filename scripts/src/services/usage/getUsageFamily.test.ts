import { getUsageFamily } from "#src/services/usage/getUsageFamily";
import { describe, expect, test } from "vitest";

describe(getUsageFamily, () => {
  test.each([
    ["claude-opus-5-5", "opus"],
    ["claude-sonnet-5-5", "sonnet"],
    ["claude-haiku-5-5", "haiku"],
    ["<synthetic>", "<synthetic>"],
  ])("%s is the %s family", (model, family) => {
    expect.hasAssertions();

    expect(getUsageFamily(model)).toBe(family);
  });
});
