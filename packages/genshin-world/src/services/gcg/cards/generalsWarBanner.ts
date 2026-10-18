import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { GcgSideState } from "#src/models/gcg/GcgSideState";

import { Element } from "#src/models/Element";
import { createGcgZoneCard } from "#src/services/gcg/effects/createGcgZoneCard";
import { GENERALS_WAR_BANNER_ID } from "#src/services/gcg/cards/constants";

const GENERALS_WAR_BANNER_ROUNDS = 2;
const GENERALS_WAR_BANNER_MAX_ROUNDS = 3;
const GENERALS_WAR_BANNER_DAMAGE = 1;

// Places a General's War Banner on a side, or, while one is in play, adds its starting rounds to it, up to the most it lasts
export const placeGeneralsWarBanner = (side: GcgSideState): void => {
  const banner = side.onstages.find(({ cardId }) => cardId === GENERALS_WAR_BANNER_ID);
  if (banner) banner.rounds = Math.min(GENERALS_WAR_BANNER_MAX_ROUNDS, banner.rounds + GENERALS_WAR_BANNER_ROUNDS);
  else side.onstages.push(createGcgZoneCard(GENERALS_WAR_BANNER_ID, generalsWarBanner));
};

// General's War Banner: the party's characters deal +1 Geo DMG while it lasts, for 2 Rounds, stacking up to 3
export const generalsWarBanner: GcgCardModule = {
  initialRounds: GENERALS_WAR_BANNER_ROUNDS,
  modifyDamageDealt: (_context, damage) =>
    damage.damageType === Element.Geo ? { ...damage, value: damage.value + GENERALS_WAR_BANNER_DAMAGE } : damage,
};
