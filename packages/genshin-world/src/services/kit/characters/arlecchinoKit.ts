import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { Attribute } from "#src/models/character/Attribute";

// The Balemoon Alone May Know, her utility passive, gives 40% Pyro DMG Bonus in combat, from no ascension, as gcsim v2.47.2
// (MIT) arlecchino/asc.go's passive() gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/arlecchino/asc.go
const PYRO_DAMAGE_BONUS = 0.4;

export const ARLECCHINO_CHARACTER_ID = 10_000_096;

// Arlecchino's behaviour: none of her own, since her six strikes, charged attack, plunges, All Is Ash's Spike and Cleave
// And Balemoon Rising are her record's alone. The Bond of Life's Pyro variant of each strike, Blood-Debt Directive, the
// Skill's cooldown reset by the burst and her constellations are not built. Her Ascension 1 passive waits on the HP-debt
// Hook, and her Ascension 4 passive's RES, which gcsim v2.47.2 does not model, is not built
export const createArlecchinoKitBehaviour = (): KitBehaviour => ({
  getPassiveBonuses: () => [{ amount: PYRO_DAMAGE_BONUS, attribute: Attribute.PyroDamageBonus }],
});
