import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { Element } from "#src/models/Element";

const GENERALS_WAR_BANNER_ROUNDS = 2;
const GENERALS_WAR_BANNER_MAX_ROUNDS = 3;
const GENERALS_WAR_BANNER_DAMAGE = 1;

// General's War Banner: the party's characters deal +1 Geo DMG while it lasts, for 2 Rounds, stacking up to 3
export const generalsWarBanner: GcgCardModule = {
  initialRounds: GENERALS_WAR_BANNER_ROUNDS,
  maxRounds: GENERALS_WAR_BANNER_MAX_ROUNDS,
  modifyDamageDealt: (_context, damage) =>
    damage.damageType === Element.Geo ? { ...damage, value: damage.value + GENERALS_WAR_BANNER_DAMAGE } : damage,
};
