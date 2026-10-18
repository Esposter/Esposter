import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { astableAnemohypostasisCreation } from "#src/services/gcg/cards/astableAnemohypostasisCreation";
import { blusteringBlade } from "#src/services/gcg/cards/blusteringBlade";
import { breastplate } from "#src/services/gcg/cards/breastplate";
import { chonghuasLayeredFrost } from "#src/services/gcg/cards/chonghuasLayeredFrost";
import { clawAndThunder } from "#src/services/gcg/cards/clawAndThunder";
import { dandelionBreeze } from "#src/services/gcg/cards/dandelionBreeze";
import { dawn } from "#src/services/gcg/cards/dawn";
import { elementalSedimentation } from "#src/services/gcg/cards/elementalSedimentation";
import { fantasticVoyage } from "#src/services/gcg/cards/fantasticVoyage";
import { fatalRainscreen } from "#src/services/gcg/cards/fatalRainscreen";
import { floralBrush } from "#src/services/gcg/cards/floralBrush";
import { flowfireEdgeSkill } from "#src/services/gcg/cards/flowfireEdgeSkill";
import { forbiddenCreation } from "#src/services/gcg/cards/forbiddenCreation";
import { frostgnaw } from "#src/services/gcg/cards/frostgnaw";
import { frostyAssault } from "#src/services/gcg/cards/frostyAssault";
import { galeBlade } from "#src/services/gcg/cards/galeBlade";
import { glacialWaltz } from "#src/services/gcg/cards/glacialWaltz";
import { guobaAttack } from "#src/services/gcg/cards/guobaAttack";
import { hide } from "#src/services/gcg/cards/hide";
import { icyPaws } from "#src/services/gcg/cards/icyPaws";
import { illusoryTorrent } from "#src/services/gcg/cards/illusoryTorrent";
import { lightningFang } from "#src/services/gcg/cards/lightningFang";
import { midnightPhantasmagoria } from "#src/services/gcg/cards/midnightPhantasmagoria";
import { mirrorReflectionOfDoom } from "#src/services/gcg/cards/mirrorReflectionOfDoom";
import { nightrider } from "#src/services/gcg/cards/nightrider";
import { niwabiFireDance } from "#src/services/gcg/cards/niwabiFireDance";
import { oceanidMimicSummoning } from "#src/services/gcg/cards/oceanidMimicSummoning";
import { pyronado } from "#src/services/gcg/cards/pyronado";
import { raincutter } from "#src/services/gcg/cards/raincutter";
import { ryuukinSaxifrage } from "#src/services/gcg/cards/ryuukinSaxifrage";
import { searingOnslaught } from "#src/services/gcg/cards/searingOnslaught";
import { signatureMix } from "#src/services/gcg/cards/signatureMix";
import { stellarRestoration, stellarRestorationFromCard } from "#src/services/gcg/cards/stellarRestoration";
import { starwardSword } from "#src/services/gcg/cards/starwardSword";
import { stellarisPhantasm } from "#src/services/gcg/cards/stellarisPhantasm";
import { theMyriadWilds } from "#src/services/gcg/cards/theMyriadWilds";
import { tideAndTorrent } from "#src/services/gcg/cards/tideAndTorrent";
import { trumpCardKitty } from "#src/services/gcg/cards/trumpCardKitty";

// Every character skill's own script, by the effect name the game gives the skill
export const GcgEffectNameSkillModuleMap: Map<string, GcgSkillModule> = new Map<string, GcgSkillModule>([
  ["Char_Skill_11022", icyPaws],
  ["Char_Skill_11023", signatureMix],
  ["Char_Skill_11032", frostgnaw],
  ["Char_Skill_11033", glacialWaltz],
  ["Char_Skill_11042", chonghuasLayeredFrost],
  ["Char_Skill_12022", fatalRainscreen],
  ["Char_Skill_12023", raincutter],
  ["Char_Skill_12032", mirrorReflectionOfDoom],
  ["Char_Skill_12033", stellarisPhantasm],
  ["Char_Skill_12034", illusoryTorrent],
  ["Char_Skill_13012", searingOnslaught],
  ["Char_Skill_13013", dawn],
  ["Char_Skill_13022", guobaAttack],
  ["Char_Skill_13023", pyronado],
  ["Char_Skill_13033", fantasticVoyage],
  ["Char_Skill_13052", niwabiFireDance],
  ["Char_Skill_13053", ryuukinSaxifrage],
  ["Char_Skill_14012", nightrider],
  ["Char_Skill_14013", midnightPhantasmagoria],
  ["Char_Skill_14022", clawAndThunder],
  ["Char_Skill_14023", lightningFang],
  ["Char_Skill_14032", stellarRestoration],
  ["Char_Skill_14032_Ex_1", stellarRestorationFromCard],
  ["Char_Skill_14033", starwardSword],
  ["Char_Skill_15012", astableAnemohypostasisCreation],
  ["Char_Skill_15013", forbiddenCreation],
  ["Char_Skill_15022", galeBlade],
  ["Char_Skill_15023", dandelionBreeze],
  ["Char_Skill_16022", breastplate],
  ["Char_Skill_17012", floralBrush],
  ["Char_Skill_17013", trumpCardKitty],
  ["Char_Skill_22012", oceanidMimicSummoning],
  ["Char_Skill_22013", theMyriadWilds],
  ["Char_Skill_22014", tideAndTorrent],
  ["Char_Skill_25012", blusteringBlade],
  ["Char_Skill_25013", frostyAssault],
  ["Char_Skill_30023", hide],
  ["Char_Skill_33024", flowfireEdgeSkill],
  ["Char_Skill_34063", elementalSedimentation],
]);
