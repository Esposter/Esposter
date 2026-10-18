import type { AttributeLine } from "#src/models/character/AttributeLine";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { RegionIdTravelerElementMap } from "#src/services/statue/RegionIdTravelerElementMap";

// The stat each element adds to the Traveler once Welkin Moon's Homecoming is done, as the wiki's Traveler page gives
// Them. Provisional until the game's table is published
const ELEMENT_BONUS_LINE_MAP: Readonly<Record<Element, AttributeLine>> = {
  [Element.Anemo]: { attribute: Attribute.CriticalRate, value: 0.1 },
  [Element.Cryo]: { attribute: Attribute.CriticalDamage, value: 0.2 },
  [Element.Dendro]: { attribute: Attribute.ElementalMastery, value: 60 },
  [Element.Electro]: { attribute: Attribute.EnergyRecharge, value: 0.2 },
  [Element.Geo]: { attribute: Attribute.DefensePercent, value: 0.2 },
  [Element.Hydro]: { attribute: Attribute.HealthPercent, value: 0.2 },
  [Element.Pyro]: { attribute: Attribute.AttackPercent, value: 0.2 },
};

// Anemo and Pyro the Traveler holds before the quest is done, so their bonuses come with it rather than with a resonance
const ELEMENTS_HELD_BEFORE_HOMECOMING: Element[] = [Element.Anemo, Element.Pyro];

// The bonus line of each element the Traveler holds once Welkin Moon's Homecoming is done: Anemo and Pyro, and each
// Element of the statues among the regions it resonated with. None before the quest is done
export const getTravelerElementBonusLines = (
  resonatedRegionIds: string[],
  isHomecomingDone: boolean,
): AttributeLine[] => {
  if (!isHomecomingDone) return [];
  const elements = new Set([
    ...ELEMENTS_HELD_BEFORE_HOMECOMING,
    ...resonatedRegionIds.flatMap((regionId) => RegionIdTravelerElementMap[regionId] ?? []),
  ]);
  return [...elements].map((element) => ELEMENT_BONUS_LINE_MAP[element]);
};
