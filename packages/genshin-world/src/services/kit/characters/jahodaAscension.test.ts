import { Element } from "#src/models/Element";
import {
  getJahodaAscensionOneEffects,
  getJahodaConstellationFourEnergy,
} from "#src/services/kit/characters/jahodaAscension";
import { describe, expect, test } from "vitest";

const NO_EFFECTS = { damageMultiplier: 1, extraRobots: 0, healMultiplier: 1, intervalMultiplier: 1 };

describe("Jahoda's Ascension 1", () => {
  test("a passive takes effect at its ascension phase", () => {
    // The team's most common element picks the effect: Electro adds a robot, Pyro scales the robots' damage, Hydro the
    // heals, and Cryo shortens the robots' interval
    expect(
      getJahodaAscensionOneEffects(1, [Element.Electro, Element.Electro, Element.Pyro, Element.Anemo]),
    ).toStrictEqual({ ...NO_EFFECTS, extraRobots: 1 });
    expect(
      getJahodaAscensionOneEffects(1, [Element.Pyro, Element.Pyro, Element.Hydro, Element.Anemo]).damageMultiplier,
    ).toBe(1.3);
    expect(
      getJahodaAscensionOneEffects(1, [Element.Hydro, Element.Hydro, Element.Cryo, Element.Anemo]).healMultiplier,
    ).toBe(1.2);
    expect(
      getJahodaAscensionOneEffects(1, [Element.Cryo, Element.Cryo, Element.Geo, Element.Anemo]).intervalMultiplier,
    ).toBe(0.9);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect(getJahodaAscensionOneEffects(0, [Element.Electro, Element.Electro, Element.Pyro])).toStrictEqual(NO_EFFECTS);
  });

  test("a tie goes to the element gcsim ranks first, Pyro over Hydro", () => {
    expect(getJahodaAscensionOneEffects(1, [Element.Hydro, Element.Pyro]).damageMultiplier).toBe(1.3);
  });

  test("a team with no element gcsim counts takes no effect", () => {
    expect(getJahodaAscensionOneEffects(1, [Element.Anemo, Element.Geo, undefined])).toStrictEqual(NO_EFFECTS);
  });
});

describe("Jahoda's Constellation 4", () => {
  test("a passive takes effect at its constellation", () => {
    // Each absorb gives her 4 energy
    expect(getJahodaConstellationFourEnergy(4)).toBe(4);
  });

  test("a passive does not take effect below its constellation", () => {
    expect(getJahodaConstellationFourEnergy(3)).toBe(0);
  });
});
