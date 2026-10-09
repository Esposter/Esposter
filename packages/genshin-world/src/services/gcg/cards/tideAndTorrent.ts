import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { Element } from "#src/models/Element";
import { takeOne } from "@esposter/shared";

// Tide and Torrent, Rhodeia of Loch's burst: 4 Hydro DMG, and one more for each friendly summon on the field (the wiki's
// Tide and Torrent (Character Card Skill))
const TIDE_AND_TORRENT_DAMAGE = 4;

export const tideAndTorrent: GcgSkillModule = {
  getDamage: ({ duel, sideIndex }) => ({
    damageType: Element.Hydro,
    value: TIDE_AND_TORRENT_DAMAGE + takeOne(duel.sides, sideIndex).summons.length,
  }),
};
