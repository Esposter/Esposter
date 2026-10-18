import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { CRYO_HILICHURL_SHOOTER_ID, cryoHilichurlShooter } from "#src/services/gcg/cards/cryoHilichurlShooter";
import { ELECTRO_HILICHURL_SHOOTER_ID, electroHilichurlShooter } from "#src/services/gcg/cards/electroHilichurlShooter";
import { HILICHURL_BERSERKER_ID, hilichurlBerserker } from "#src/services/gcg/cards/hilichurlBerserker";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne } from "@esposter/shared";

export const ABYSSAL_SUMMONS_ID = 332_015;
const ABYSSAL_SUMMON_POOL: [number, GcgCardModule][] = [
  [CRYO_HILICHURL_SHOOTER_ID, cryoHilichurlShooter],
  [HILICHURL_BERSERKER_ID, hilichurlBerserker],
  [ELECTRO_HILICHURL_SHOOTER_ID, electroHilichurlShooter],
];

// Abyssal Summons, an event: summons one of the three Hilichurl summons at random, with the draw the duel gives (the wiki's
// Abyssal Summons)
export const abyssalSummons: GcgCardModule = {
  play: ({ duel, sideIndex }) => {
    const [cardId, module] = takeOne(ABYSSAL_SUMMON_POOL, Math.floor(duel.random() * ABYSSAL_SUMMON_POOL.length));
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, cardId, module);
  },
};
