import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { takeOne } from "@esposter/shared";
import { ILLUSORY_TORRENT_ID } from "#src/services/gcg/cards/constants";

// Illusory Torrent, Mona's passive: once a round, while Mona is active, switching away from her is a fast action
export const illusoryTorrent: GcgSkillModule = {
  checkIsSwitchFast: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedSkillIds.includes(ILLUSORY_TORRENT_ID)) return false;
    side.usedSkillIds.push(ILLUSORY_TORRENT_ID);
    return true;
  },
};
