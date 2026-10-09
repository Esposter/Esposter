import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgTalentCard } from "#src/services/gcg/effects/createGcgTalentCard";
import { takeOne } from "@esposter/shared";

const RHODEIA_OF_LOCH_ID = 2201;
const TIDE_AND_TORRENT_ID = 22_014;

// Streaming Surge: Rhodeia of Loch, while active, equips it, and Tide and Torrent is used at once; each use of Tide and
// Torrent by her gives every summon of her side one usage
export const streamingSurge: GcgCardModule = {
  ...createGcgTalentCard(RHODEIA_OF_LOCH_ID, TIDE_AND_TORRENT_ID),
  onSkillUsed: ({ duel, sideIndex }, skill) => {
    if (skill.id !== TIDE_AND_TORRENT_ID) return;
    for (const summon of takeOne(duel.sides, sideIndex).summons) summon.usages += 1;
  },
};
