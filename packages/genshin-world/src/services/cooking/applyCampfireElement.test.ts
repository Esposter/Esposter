import { Element } from "#src/models/Element";
import { applyCampfireElement } from "#src/services/cooking/applyCampfireElement";
import { describe, expect, test } from "vitest";

describe(applyCampfireElement, () => {
  test("should light an unlit campfire from Pyro", () => {
    expect.hasAssertions();

    expect(applyCampfireElement(false, Element.Pyro)).toBe(true);
  });

  test("should put a lit campfire out from each element that does", () => {
    expect.hasAssertions();

    expect(applyCampfireElement(true, Element.Hydro)).toBe(false);
  });

  test("should leave a campfire as it was for an element that neither lights nor puts it out", () => {
    expect.hasAssertions();

    expect(applyCampfireElement(true, Element.Dendro)).toBe(true);
    expect(applyCampfireElement(false, Element.Dendro)).toBe(false);
  });
});
