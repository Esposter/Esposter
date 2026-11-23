import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { ASCENDANT_GLEAM_MAXIMUM_REACTION_BONUS } from "#src/services/party/constants";
import { exhaustiveGuard } from "@esposter/shared";

// The reaction bonus Ascendant Gleam gives every Lunar damage, from the stats of the character that lit it outside its
// Buffs, by its element: 0.9% for every 100 ATK of an Electro, Pyro or Cryo character, 0.6% for every 1,000 Max HP of
// A Hydro one, 2.25% for every 100 Elemental Mastery of a Dendro or Anemo one and 1% for every 100 DEF of a Geo one, at
// Most 36%, as gcsim (MIT) pkg/simulation/setup.go gives it
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/pkg/simulation/setup.go
// The 0.006 Hydro coefficient is not read from the weapon passives' dataset, though row 114431 of the dump's
// EquipAffixExcelConfigData holds the same 0.006 at its first rank: that row is Echoes of the Plentiful Land (the
// Ring of Yaxche's passive), a Normal Attack DMG increase per 1,000 Max HP, a different mechanic. No dump table gives
// The Ascendant Gleam's own coefficients, so they stay gcsim's
export const getAscendantGleamBonus = ({ attributes, element }: Combatant): number => {
  if (element === undefined) return 0;
  const { attack, attributeTotalMap, defense, maxHealth } = attributes;
  let bonus: number;
  switch (element) {
    case Element.Anemo:
    case Element.Dendro:
      bonus = (attributeTotalMap[Attribute.ElementalMastery] / 100) * 0.0225;
      break;
    case Element.Cryo:
    case Element.Electro:
    case Element.Pyro:
      bonus = (attack / 100) * 0.009;
      break;
    case Element.Geo:
      bonus = (defense / 100) * 0.01;
      break;
    case Element.Hydro:
      bonus = (maxHealth / 1000) * 0.006;
      break;
    default:
      return exhaustiveGuard(element);
  }
  return Math.min(bonus, ASCENDANT_GLEAM_MAXIMUM_REACTION_BONUS);
};
