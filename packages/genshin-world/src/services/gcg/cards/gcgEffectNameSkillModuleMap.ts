import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { dawn } from "#src/services/gcg/cards/dawn";
import { fantasticVoyage } from "#src/services/gcg/cards/fantasticVoyage";
import { illusoryTorrent } from "#src/services/gcg/cards/illusoryTorrent";
import { mirrorReflectionOfDoom } from "#src/services/gcg/cards/mirrorReflectionOfDoom";
import { searingOnslaught } from "#src/services/gcg/cards/searingOnslaught";
import { stellarisPhantasm } from "#src/services/gcg/cards/stellarisPhantasm";

// Every character skill's own script, by the effect name the game gives the skill
export const GcgEffectNameSkillModuleMap: Map<string, GcgSkillModule> = new Map<string, GcgSkillModule>([
  ["Char_Skill_12032", mirrorReflectionOfDoom],
  ["Char_Skill_12033", stellarisPhantasm],
  ["Char_Skill_12034", illusoryTorrent],
  ["Char_Skill_13012", searingOnslaught],
  ["Char_Skill_13013", dawn],
  ["Char_Skill_13033", fantasticVoyage],
]);
