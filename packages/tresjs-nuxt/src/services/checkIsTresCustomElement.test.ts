import { checkIsTresCustomElement } from "#src/services/checkIsTresCustomElement";
import { TRES_CORE_COMPONENT_NAMES } from "#src/services/constants";
import * as tresCore from "@tresjs/core";
import { describe, expect, test } from "vitest";

describe(checkIsTresCustomElement, () => {
  test.each([
    ["TresMesh", true],
    ["tres-mesh", true],
    ["primitive", true],
    ["TresCanvas", false],
    ["TresScene", false],
    ["Tresor", false],
    ["div", false],
  ])("%s", (tagName, expected) => {
    expect.hasAssertions();

    expect(checkIsTresCustomElement(tagName)).toBe(expected);
  });

  // The predicate and the core's own component list restate the renderer's rule, since configuration cannot load it,
  // So the renderer answers for every Tres export and every name listed here, and a change in its rule fails this test
  const coreTresNames = Object.keys(tresCore).filter((name) => /^Tres[A-Z]/u.test(name));

  test.each([...new Set([...TRES_CORE_COMPONENT_NAMES, ...coreTresNames])])(
    "%s matches the renderer's predicate",
    (tagName) => {
      expect.hasAssertions();

      expect(checkIsTresCustomElement(tagName)).toBe(
        tresCore.templateCompilerOptions.template.compilerOptions.isCustomElement(tagName),
      );
    },
  );
});
