import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { cryoHilichurlShooter } from "#src/services/gcg/cards/cryoHilichurlShooter";
import { CRYO_HILICHURL_SHOOTER_ID } from "#src/services/gcg/cards/constants";
import { electroHilichurlShooter } from "#src/services/gcg/cards/electroHilichurlShooter";
import { ELECTRO_HILICHURL_SHOOTER_ID } from "#src/services/gcg/cards/constants";
import { hilichurlBerserker } from "#src/services/gcg/cards/hilichurlBerserker";
import { HILICHURL_BERSERKER_ID } from "#src/services/gcg/cards/constants";
import { placeGcgZoneCard } from "#src/services/gcg/effects/placeGcgZoneCard";
import { takeOne, takeRandom } from "@esposter/shared";

const ABYSSAL_SUMMON_POOL: [number, GcgCardModule][] = [
  [CRYO_HILICHURL_SHOOTER_ID, cryoHilichurlShooter],
  [HILICHURL_BERSERKER_ID, hilichurlBerserker],
  [ELECTRO_HILICHURL_SHOOTER_ID, electroHilichurlShooter],
];

// Abyssal Summons, an event: summons one of the three Hilichurl summons at random, with the draw the duel gives (the wiki's
// Abyssal Summons)
export const abyssalSummons: GcgCardModule = {
  play: ({ duel, sideIndex }) => {
    const [cardId, module] = takeRandom(ABYSSAL_SUMMON_POOL, duel.random);
    placeGcgZoneCard(takeOne(duel.sides, sideIndex).summons, cardId, module);
  },
};
