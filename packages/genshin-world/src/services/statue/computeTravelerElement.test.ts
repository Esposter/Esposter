import { Element } from "#src/models/Element";
import { computeTravelerElement } from "#src/services/statue/computeTravelerElement";
import { describe, expect, test } from "vitest";

describe(computeTravelerElement, () => {
  test("the traveler takes the element of the statue it resonates with", () => {
    expect.hasAssertions();

    expect(computeTravelerElement(["liyue"])).toBe(Element.Geo);
  });

  test("the statue last resonated with gives the Traveler its element", () => {
    expect.hasAssertions();

    expect(computeTravelerElement(["liyue", "mondstadt"])).toBe(Element.Anemo);
  });

  test("the Traveler holds no element before any statue is resonated with", () => {
    expect.hasAssertions();

    expect(computeTravelerElement([])).toBeUndefined();
  });
});
