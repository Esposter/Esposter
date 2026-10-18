import type { AttackArea } from "#src/models/kit/AttackArea";

import { Attribute } from "#src/models/character/Attribute";

// The area a passive's extra hit reaches about its wielder when the passive names a small AoE. The game's own area is not
// In the dump, so this is provisional
export const SMALL_AOE_AREA: AttackArea = { angle: 2 * Math.PI, height: 5, radius: 2 };
// The seven elements' DMG Bonus attributes, which a passive naming all Elemental DMG raises alike
export const ELEMENTAL_DAMAGE_BONUS_ATTRIBUTES: readonly Attribute[] = [
  Attribute.AnemoDamageBonus,
  Attribute.CryoDamageBonus,
  Attribute.DendroDamageBonus,
  Attribute.ElectroDamageBonus,
  Attribute.GeoDamageBonus,
  Attribute.HydroDamageBonus,
  Attribute.PyroDamageBonus,
];
