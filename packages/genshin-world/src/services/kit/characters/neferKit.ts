import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";

export const NEFER_CHARACTER_ID = 10_000_122;

// Dusklit Eaves, her Moonsign Benediction: the Base DMG a party's Lunar-Bloom gains for every point of her Elemental
// Mastery, up to its maximum
const BENEDICTION_BASE_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY = 0.000175;
const BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS = 0.14;

// Nefer's behaviour: her Benediction's Base DMG Bonus, and none else of her own, since her strikes, charged attack,
// Plunges and burst's hit are her record's alone. Her skill and passives wait on their hooks, and her record's frames
// And areas are provisional, read from Borrowed donors' gcsim hitmarks and areas.
// Constellation 1 needs the Shadow Dance Charged Attack, which the kit does not build
// Constellation 2 needs the Ascension talent A Wager of Moonlight's Veil of Falsehood, which the kit does not build
// Constellation 4 needs the Shadow Dance Charged Attack with Verdant Dew, which the kit does not build
// Constellation 6 needs the Shadow Dance Charged Attack and Phantasm Performance, which the kit does not build
export const createNeferKitBehaviour = (): KitBehaviour => ({
  moonsignBenediction: {
    getBaseDamageBonus: (combatant) =>
      Math.min(
        combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] *
          BENEDICTION_BASE_DAMAGE_BONUS_PER_ELEMENTAL_MASTERY,
        BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS,
      ),
  },
});
