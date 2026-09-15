import { getComponentName } from "#src/services/sweeps/staleNames/getComponentName";
import { describe, expect, test } from "vitest";

describe(getComponentName, () => {
  test.each([
    ["a component at the root", "Ab.vue", "Ab"],
    ["the folders prefixing the file name", "Ab/Bc/Cd.vue", "AbBcCd"],
    ["a file name repeating its folder", "Ab/Bc/BcCd.vue", "AbBcCd"],
    ["a file name repeating two folders", "Ab/Bc/AbBcCd.vue", "AbBcCd"],
    ["a file named after its folder", "Ab/Ab.vue", "Ab"],
    ["an index file", "Ab/Bc/Index.vue", "AbBc"],
  ])("derives %s", (_title, componentPath, name) => {
    expect.hasAssertions();

    expect(getComponentName(componentPath)).toBe(name);
  });
});
