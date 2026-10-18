import { Element } from "#src/models/Element";

// Measured: gcsim (MIT, v2.47.2) jahoda/asc.go and cons.go. Ascension 1 reads the team's most common element of the four,
// The first of them in gcsim's order on a tie, and its effect: Pyro scales the robots' damage, Hydro the heals, Electro
// Adds a robot, and Cryo shortens the robots' interval. At Ascendant Gleam, Constellation 2 gives the team's second most
// Common element that same effect. Constellation 4 gives her 4 energy each time a robot absorbs an element, and Ascension 4
// Gives the active character Elemental Mastery each time she heals above 70% of her health
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jahoda/asc.go
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jahoda/cons.go
const JAHODA_ASCENSION_1 = 1;
export const JAHODA_ASCENSION_4 = 4;
export const JAHODA_ASCENSION_4_ELEMENTAL_MASTERY = 100;
export const JAHODA_ASCENSION_4_SECONDS = 6;
export const JAHODA_ASCENSION_4_SOURCE = "jahoda-ascension-4";
const JAHODA_CONSTELLATION_2 = 2;
const JAHODA_CONSTELLATION_4 = 4;
const ASCENSION_1_ELEMENT_PRIORITY: readonly Element[] = [Element.Pyro, Element.Hydro, Element.Electro, Element.Cryo];
const ASCENSION_1_DAMAGE_MULTIPLIER = 1.3;
const ASCENSION_1_HEAL_MULTIPLIER = 1.2;
const ASCENSION_1_EXTRA_ROBOTS = 1;
const ASCENSION_1_INTERVAL_MULTIPLIER = 0.9;
const CONSTELLATION_4_ENERGY = 4;

interface JahodaElementEffects {
  damageMultiplier: number;
  extraRobots: number;
  healMultiplier: number;
  intervalMultiplier: number;
}

const NO_ELEMENT_EFFECTS: JahodaElementEffects = {
  damageMultiplier: 1,
  extraRobots: 0,
  healMultiplier: 1,
  intervalMultiplier: 1,
};

const getElementEffects = (element: Element | undefined): JahodaElementEffects => {
  switch (element) {
    case Element.Pyro:
      return { ...NO_ELEMENT_EFFECTS, damageMultiplier: ASCENSION_1_DAMAGE_MULTIPLIER };
    case Element.Hydro:
      return { ...NO_ELEMENT_EFFECTS, healMultiplier: ASCENSION_1_HEAL_MULTIPLIER };
    case Element.Electro:
      return { ...NO_ELEMENT_EFFECTS, extraRobots: ASCENSION_1_EXTRA_ROBOTS };
    case Element.Cryo:
      return { ...NO_ELEMENT_EFFECTS, intervalMultiplier: ASCENSION_1_INTERVAL_MULTIPLIER };
    default:
      return NO_ELEMENT_EFFECTS;
  }
};

// The team's most common element of the four, leaving out the one given, the first of them in gcsim's order on a tie
const getMostCommonElement = (
  deployedElements: readonly (Element | undefined)[],
  leftOutElement?: Element,
): Element | undefined => {
  let mostCommonElement: Element | undefined;
  let mostCommonCount = 0;
  for (const element of ASCENSION_1_ELEMENT_PRIORITY) {
    if (element === leftOutElement) continue;
    const count = deployedElements.filter((deployedElement) => deployedElement === element).length;
    if (count > mostCommonCount) {
      mostCommonCount = count;
      mostCommonElement = element;
    }
  }
  return mostCommonElement;
};

// The effects the team's elements give her robots and heals. Ascension 1 gives the most common element its effect, and at
// Ascendant Gleam Constellation 2 gives the second most common one its effect too. The two are different elements, so their
// Effects touch different stats and add up
export const getJahodaElementEffects = (
  ascension: number,
  constellationCount: number,
  isAscendantGleam: boolean,
  deployedElements: readonly (Element | undefined)[],
): JahodaElementEffects => {
  if (ascension < JAHODA_ASCENSION_1) return NO_ELEMENT_EFFECTS;
  const mostCommonElement = getMostCommonElement(deployedElements);
  const secondMostCommonElement =
    constellationCount >= JAHODA_CONSTELLATION_2 && isAscendantGleam
      ? getMostCommonElement(deployedElements, mostCommonElement)
      : undefined;
  const first = getElementEffects(mostCommonElement);
  const second = getElementEffects(secondMostCommonElement);
  return {
    damageMultiplier: first.damageMultiplier * second.damageMultiplier,
    extraRobots: first.extraRobots + second.extraRobots,
    healMultiplier: first.healMultiplier * second.healMultiplier,
    intervalMultiplier: first.intervalMultiplier * second.intervalMultiplier,
  };
};

// The energy Constellation 4 gives her each time a robot absorbs an element, from her constellations as they stand
export const getJahodaConstellationFourEnergy = (constellationCount: number): number =>
  constellationCount < JAHODA_CONSTELLATION_4 ? 0 : CONSTELLATION_4_ENERGY;
