import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";

export const ZIBAI_CHARACTER_ID = 10_000_126;

// The Coursing Sun and Moon, her Moonsign Benediction: the Base DMG a party's Lunar-Crystallize gains for every point of
// Her Defense, up to its maximum
const BENEDICTION_BASE_DAMAGE_BONUS_PER_DEFENSE = 0.00007;
const BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS = 0.14;

// Zibai's behaviour: her Benediction's Base DMG Bonus, and none else of her own, since her strikes, burst, charged attack
// And plunges are her record's alone. Her skill and passives wait on their hooks, and her record's frames and areas are
// Provisional, read from a Borrowed donor's gcsim hitmarks and areas.
// Constellation 1 needs Heaven and Earth Made Manifest's effects, which the kit does not build
// Constellation 2 needs the Lunar Phase Shift's effects, which the kit does not build
// Constellation 4 needs the Lunar Phase Shift's effects, which the kit does not build
// Constellation 6 needs the Lunar Phase Shift's effects, which the kit does not build
export const createZibaiKitBehaviour = (): KitBehaviour => ({
  moonsignBenediction: {
    getBaseDamageBonus: (combatant) =>
      Math.min(
        combatant.attributes.attributeTotalMap[Attribute.Defense] * BENEDICTION_BASE_DAMAGE_BONUS_PER_DEFENSE,
        BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS,
      ),
  },
});
