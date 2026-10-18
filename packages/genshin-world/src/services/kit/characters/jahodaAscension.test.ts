import { Element } from "#src/models/Element";
import {
  getJahodaConstellationFourEnergy,
  getJahodaElementEffects,
} from "#src/services/kit/characters/jahodaAscension";
import { describe, expect, test } from "vitest";

const NO_EFFECTS = { damageMultiplier: 1, extraRobots: 0, healMultiplier: 1, intervalMultiplier: 1 };

describe("jahoda's Ascension 1", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    // The team's most common element picks the effect: Electro adds a robot, Pyro scales the robots' damage, Hydro the
    // Heals, and Cryo shortens the robots' interval
    expect(
      getJahodaElementEffects(1, 0, false, [Element.Electro, Element.Electro, Element.Pyro, Element.Anemo]),
    ).toStrictEqual({ ...NO_EFFECTS, extraRobots: 1 });
    expect(
      getJahodaElementEffects(1, 0, false, [Element.Pyro, Element.Pyro, Element.Hydro, Element.Anemo]).damageMultiplier,
    ).toBe(1.3);
    expect(
      getJahodaElementEffects(1, 0, false, [Element.Hydro, Element.Hydro, Element.Cryo, Element.Anemo]).healMultiplier,
    ).toBe(1.2);
    expect(
      getJahodaElementEffects(1, 0, false, [Element.Cryo, Element.Cryo, Element.Geo, Element.Anemo]).intervalMultiplier,
    ).toBe(0.9);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    expect(getJahodaElementEffects(0, 2, true, [Element.Electro, Element.Electro, Element.Pyro])).toStrictEqual(
      NO_EFFECTS,
    );
  });

  test("a tie goes to the element gcsim ranks first, Pyro over Hydro", () => {
    expect.hasAssertions();
    expect(getJahodaElementEffects(1, 0, false, [Element.Hydro, Element.Pyro]).damageMultiplier).toBe(1.3);
  });

  test("a team with no element gcsim counts takes no effect", () => {
    expect.hasAssertions();
    expect(getJahodaElementEffects(1, 0, false, [Element.Anemo, Element.Geo, undefined])).toStrictEqual(NO_EFFECTS);
  });
});

describe("jahoda's Constellation 2", () => {
  test("at Ascendant Gleam, the team's second-highest element's effect joins Ascension 1's", () => {
    expect.hasAssertions();
    // Pyro is highest, and Hydro and Electro tie for second, where gcsim ranks Hydro first
    expect(
      getJahodaElementEffects(1, 2, true, [Element.Pyro, Element.Pyro, Element.Hydro, Element.Electro]),
    ).toStrictEqual({ ...NO_EFFECTS, damageMultiplier: 1.3, healMultiplier: 1.2 });
  });

  test("the two elements' effects add up on the stats they touch", () => {
    expect.hasAssertions();
    expect(
      getJahodaElementEffects(1, 2, true, [Element.Electro, Element.Electro, Element.Cryo, Element.Anemo]),
    ).toStrictEqual({ ...NO_EFFECTS, extraRobots: 1, intervalMultiplier: 0.9 });
  });

  test("a passive does not take effect below its constellation", () => {
    expect.hasAssertions();
    expect(getJahodaElementEffects(1, 1, true, [Element.Pyro, Element.Pyro, Element.Hydro])).toStrictEqual({
      ...NO_EFFECTS,
      damageMultiplier: 1.3,
    });
  });

  test("a passive does not take effect below Ascendant Gleam", () => {
    expect.hasAssertions();
    expect(getJahodaElementEffects(1, 2, false, [Element.Pyro, Element.Pyro, Element.Hydro])).toStrictEqual({
      ...NO_EFFECTS,
      damageMultiplier: 1.3,
    });
  });

  test("a team with one element takes no second effect", () => {
    expect.hasAssertions();
    expect(getJahodaElementEffects(1, 2, true, [Element.Pyro, Element.Pyro, Element.Pyro])).toStrictEqual({
      ...NO_EFFECTS,
      damageMultiplier: 1.3,
    });
  });
});

describe("jahoda's Constellation 4", () => {
  test("a passive takes effect at its constellation", () => {
    expect.hasAssertions();
    // Each absorb gives her 4 energy
    expect(getJahodaConstellationFourEnergy(4)).toBe(4);
  });

  test("a passive does not take effect below its constellation", () => {
    expect.hasAssertions();
    expect(getJahodaConstellationFourEnergy(3)).toBe(0);
  });
});
