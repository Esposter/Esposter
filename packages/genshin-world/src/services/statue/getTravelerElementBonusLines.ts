import type { AttributeLine } from "#src/models/character/AttributeLine";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";

// The stat each element resonated with adds to the Traveler once the quest the game names is done, as the wiki's Traveler
// Page gives them. Provisional until the game's table is published
const ELEMENT_BONUS_LINE_MAP: Readonly<Record<Element, AttributeLine>> = {
  [Element.Anemo]: { attribute: Attribute.CriticalRate, value: 0.1 },
  [Element.Cryo]: { attribute: Attribute.CriticalDamage, value: 0.2 },
  [Element.Dendro]: { attribute: Attribute.ElementalMastery, value: 60 },
  [Element.Electro]: { attribute: Attribute.EnergyRecharge, value: 0.2 },
  [Element.Geo]: { attribute: Attribute.DefensePercent, value: 0.2 },
  [Element.Hydro]: { attribute: Attribute.HealthPercent, value: 0.2 },
  [Element.Pyro]: { attribute: Attribute.AttackPercent, value: 0.2 },
};

// The attribute line each element the Traveler has resonated with adds, in the order they were resonated with. The caller
// Passes none until the quest's step is done
export const getTravelerElementBonusLines = (resonatedElements: readonly Element[]): AttributeLine[] =>
  resonatedElements.map((element) => ({ ...ELEMENT_BONUS_LINE_MAP[element] }));
