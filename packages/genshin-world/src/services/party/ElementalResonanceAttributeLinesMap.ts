import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { ElementalResonance } from "#src/models/party/ElementalResonance";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { SpecialResonance } from "#src/models/party/SpecialResonance";

// The attribute lines each resonance adds to every member of the deployed team while it holds it, summed in with the
// Members' own by computeCharacterAttributes. Each figure is the game's as the Elemental Resonance page of the Genshin
// Impact Wiki (https://genshin-impact.fandom.com/wiki/Elemental_Resonance) gives it. The effects that need machinery
// Not built yet (the Cryo and Hydro durations, the Electro particle, the Anemo stamina, movement and skill cooldown, the
// Geo shield damage and enemy RES, the Dendro timed EM) are not here, and are listed on the party proposal
export const ElementalResonanceAttributeLinesMap: Record<ElementalResonance, AttributeLine[]> = {
  // Its stamina, movement and skill cooldown are applied where those are read, not summed here
  [Element.Anemo]: [],
  // Its CRIT Rate against Frozen or Cryo enemies is applied where the hit is struck, not summed here
  [Element.Cryo]: [],
  // Elemental Mastery +50 (its timed bonus after a reaction is not built)
  [Element.Dendro]: [{ attribute: Attribute.ElementalMastery, value: 50 }],
  // Its particle chance is applied where a reaction triggers, not summed here
  [Element.Electro]: [],
  // Shield strength +15%
  [Element.Geo]: [{ attribute: Attribute.ShieldStrength, value: 0.15 }],
  // Max HP +25%
  [Element.Hydro]: [{ attribute: Attribute.HealthPercent, value: 0.25 }],
  // ATK +25%
  [Element.Pyro]: [{ attribute: Attribute.AttackPercent, value: 0.25 }],
  // All Elemental RES +15% and Physical RES +15%
  [SpecialResonance.ProtectiveCanopy]: [
    { attribute: Attribute.PhysicalResistance, value: 0.15 },
    { attribute: Attribute.AnemoResistance, value: 0.15 },
    { attribute: Attribute.CryoResistance, value: 0.15 },
    { attribute: Attribute.DendroResistance, value: 0.15 },
    { attribute: Attribute.ElectroResistance, value: 0.15 },
    { attribute: Attribute.GeoResistance, value: 0.15 },
    { attribute: Attribute.HydroResistance, value: 0.15 },
    { attribute: Attribute.PyroResistance, value: 0.15 },
  ],
};
