import { Element } from "#src/models/Element";

// Measured: gcsim (MIT, v2.47.2) jahoda/asc.go and cons.go. Ascension 1 reads the team's most common element of the four,
// the first of them in gcsim's order on a tie, and its effect: Pyro scales the robots' damage, Hydro the heals, Electro
// adds a robot and Cryo shortens the robots' interval. Constellation 4 gives her 4 energy each time a robot absorbs
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jahoda/asc.go
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/jahoda/cons.go
export const JAHODA_ASCENSION_1 = 1;
export const JAHODA_CONSTELLATION_4 = 4;
const ASCENSION_1_ELEMENT_PRIORITY: readonly Element[] = [Element.Pyro, Element.Hydro, Element.Electro, Element.Cryo];
const ASCENSION_1_DAMAGE_MULTIPLIER = 1.3;
const ASCENSION_1_HEAL_MULTIPLIER = 1.2;
const ASCENSION_1_EXTRA_ROBOTS = 1;
const ASCENSION_1_INTERVAL_MULTIPLIER = 0.9;
const CONSTELLATION_4_ENERGY = 4;

export interface JahodaAscensionOneEffects {
  damageMultiplier: number;
  extraRobots: number;
  healMultiplier: number;
  intervalMultiplier: number;
}

const NO_ASCENSION_ONE_EFFECTS: JahodaAscensionOneEffects = {
  damageMultiplier: 1,
  extraRobots: 0,
  healMultiplier: 1,
  intervalMultiplier: 1,
};

// The effects of Ascension 1 for the team's elements, which the deployed members give, Jahoda included. A team with none
// of the four it counts takes none
export const getJahodaAscensionOneEffects = (
  ascension: number,
  deployedElements: readonly (Element | undefined)[],
): JahodaAscensionOneEffects => {
  if (ascension < JAHODA_ASCENSION_1) return NO_ASCENSION_ONE_EFFECTS;
  let highestElement: Element | undefined;
  let highestCount = 0;
  for (const element of ASCENSION_1_ELEMENT_PRIORITY) {
    const count = deployedElements.filter((deployedElement) => deployedElement === element).length;
    if (count > highestCount) {
      highestCount = count;
      highestElement = element;
    }
  }
  switch (highestElement) {
    case Element.Pyro:
      return { ...NO_ASCENSION_ONE_EFFECTS, damageMultiplier: ASCENSION_1_DAMAGE_MULTIPLIER };
    case Element.Hydro:
      return { ...NO_ASCENSION_ONE_EFFECTS, healMultiplier: ASCENSION_1_HEAL_MULTIPLIER };
    case Element.Electro:
      return { ...NO_ASCENSION_ONE_EFFECTS, extraRobots: ASCENSION_1_EXTRA_ROBOTS };
    case Element.Cryo:
      return { ...NO_ASCENSION_ONE_EFFECTS, intervalMultiplier: ASCENSION_1_INTERVAL_MULTIPLIER };
    default:
      return NO_ASCENSION_ONE_EFFECTS;
  }
};

// The energy Constellation 4 gives her each time a robot absorbs an element, from her constellations as they stand
export const getJahodaConstellationFourEnergy = (constellationCount: number): number =>
  constellationCount < JAHODA_CONSTELLATION_4 ? 0 : CONSTELLATION_4_ENERGY;
