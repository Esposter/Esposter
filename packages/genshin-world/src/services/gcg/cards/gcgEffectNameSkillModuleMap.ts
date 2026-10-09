import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { blusteringBlade } from "#src/services/gcg/cards/blusteringBlade";
import { chonghuasLayeredFrost } from "#src/services/gcg/cards/chonghuasLayeredFrost";
import { clawAndThunder } from "#src/services/gcg/cards/clawAndThunder";
import { dawn } from "#src/services/gcg/cards/dawn";
import { fantasticVoyage } from "#src/services/gcg/cards/fantasticVoyage";
import { frostyAssault } from "#src/services/gcg/cards/frostyAssault";
import { illusoryTorrent } from "#src/services/gcg/cards/illusoryTorrent";
import { lightningFang } from "#src/services/gcg/cards/lightningFang";
import { mirrorReflectionOfDoom } from "#src/services/gcg/cards/mirrorReflectionOfDoom";
import { niwabiFireDance } from "#src/services/gcg/cards/niwabiFireDance";
import { oceanidMimicSummoning } from "#src/services/gcg/cards/oceanidMimicSummoning";
import { ryuukinSaxifrage } from "#src/services/gcg/cards/ryuukinSaxifrage";
import { searingOnslaught } from "#src/services/gcg/cards/searingOnslaught";
import { stellarisPhantasm } from "#src/services/gcg/cards/stellarisPhantasm";
import { theMyriadWilds } from "#src/services/gcg/cards/theMyriadWilds";
import { tideAndTorrent } from "#src/services/gcg/cards/tideAndTorrent";

// Every character skill's own script, by the effect name the game gives the skill
export const GcgEffectNameSkillModuleMap: Map<string, GcgSkillModule> = new Map<string, GcgSkillModule>([
  ["Char_Skill_11042", chonghuasLayeredFrost],
  ["Char_Skill_12032", mirrorReflectionOfDoom],
  ["Char_Skill_12033", stellarisPhantasm],
  ["Char_Skill_12034", illusoryTorrent],
  ["Char_Skill_13012", searingOnslaught],
  ["Char_Skill_13013", dawn],
  ["Char_Skill_13033", fantasticVoyage],
  ["Char_Skill_13052", niwabiFireDance],
  ["Char_Skill_13053", ryuukinSaxifrage],
  ["Char_Skill_14022", clawAndThunder],
  ["Char_Skill_14023", lightningFang],
  ["Char_Skill_22012", oceanidMimicSummoning],
  ["Char_Skill_22013", theMyriadWilds],
  ["Char_Skill_22014", tideAndTorrent],
  ["Char_Skill_25012", blusteringBlade],
  ["Char_Skill_25013", frostyAssault],
]);
