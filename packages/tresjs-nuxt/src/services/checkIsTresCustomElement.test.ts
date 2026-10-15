import { checkIsTresCustomElement } from "#src/services/checkIsTresCustomElement";
import { describe, expect, test } from "vitest";

describe("checkIsTresCustomElement", () => {
  test.each([
    ["TresMesh", true],
    ["tres-mesh", true],
    ["primitive", true],
    ["TresCanvas", false],
    ["TresScene", false],
    ["Tresor", false],
    ["div", false],
  ])("%s", (tagName, expected) => {
    expect(checkIsTresCustomElement(tagName)).toBe(expected);
  });
});
