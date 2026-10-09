import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";
import { takeOne } from "@esposter/shared";

const ILLUSORY_TORRENT_ID = 12_034;

// Illusory Torrent, Mona's passive: once a round, while Mona is active, switching away from her is a fast action
export const illusoryTorrent: GcgSkillModule = {
  isSwitchFast: ({ duel, sideIndex }) => {
    const side = takeOne(duel.sides, sideIndex);
    if (side.usedSkillIds.includes(ILLUSORY_TORRENT_ID)) return false;
    side.usedSkillIds.push(ILLUSORY_TORRENT_ID);
    return true;
  },
};
