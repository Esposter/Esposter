import type { GcgSkillModule } from "#src/models/gcg/GcgSkillModule";

import { astableAnemohypostasisCreation } from "#src/services/gcg/cards/astableAnemohypostasisCreation";
import { baneOfAllEvil } from "#src/services/gcg/cards/baneOfAllEvil";
import { blazingStrike } from "#src/services/gcg/cards/blazingStrike";
import { blusteringBlade } from "#src/services/gcg/cards/blusteringBlade";
import { breastplate } from "#src/services/gcg/cards/breastplate";
import { chonghuasLayeredFrost } from "#src/services/gcg/cards/chonghuasLayeredFrost";
import { clawAndThunder } from "#src/services/gcg/cards/clawAndThunder";
import { dandelionBreeze } from "#src/services/gcg/cards/dandelionBreeze";
import { dawn } from "#src/services/gcg/cards/dawn";
import { divineMaidensDeliverance } from "#src/services/gcg/cards/divineMaidensDeliverance";
import { electroCrystalCoreSkill } from "#src/services/gcg/cards/electroCrystalCoreSkill";
import { elementalSedimentation } from "#src/services/gcg/cards/elementalSedimentation";
import { fantasticVoyage } from "#src/services/gcg/cards/fantasticVoyage";
import { fatalRainscreen } from "#src/services/gcg/cards/fatalRainscreen";
import { fieryRebirthSkill } from "#src/services/gcg/cards/fieryRebirthSkill";
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
import { infusedStonehide } from "#src/services/gcg/cards/infusedStonehide";
import { inuzakaAllRoundDefense } from "#src/services/gcg/cards/inuzakaAllRoundDefense";
import { juugaForwardUntoVictory } from "#src/services/gcg/cards/juugaForwardUntoVictory";
import { kamisatoArtSenhoSkill } from "#src/services/gcg/cards/kamisatoArtSenhoSkill";
import { kamisatoArtSoumetsu } from "#src/services/gcg/cards/kamisatoArtSoumetsu";
import { koukouSendou } from "#src/services/gcg/cards/koukouSendou";
import { kurageOath } from "#src/services/gcg/cards/kurageOath";
import { lightningFang } from "#src/services/gcg/cards/lightningFang";
import { lightningLockdown } from "#src/services/gcg/cards/lightningLockdown";
import { masatsuZetsugi } from "#src/services/gcg/cards/masatsuZetsugi";
import { midnightPhantasmagoria } from "#src/services/gcg/cards/midnightPhantasmagoria";
import { mirrorReflectionOfDoom } from "#src/services/gcg/cards/mirrorReflectionOfDoom";
import { nereidsAscension } from "#src/services/gcg/cards/nereidsAscension";
import { nightrider } from "#src/services/gcg/cards/nightrider";
import { niwabiFireDance } from "#src/services/gcg/cards/niwabiFireDance";
import { oceanidMimicSummoning } from "#src/services/gcg/cards/oceanidMimicSummoning";
import { ominousStar } from "#src/services/gcg/cards/ominousStar";
import { pyronado } from "#src/services/gcg/cards/pyronado";
import { raincutter } from "#src/services/gcg/cards/raincutter";
import { rockPaperScissorsCombo } from "#src/services/gcg/cards/rockPaperScissorsCombo";
import { rockPaperScissorsScissors } from "#src/services/gcg/cards/rockPaperScissorsScissors";
import { royalDescent } from "#src/services/gcg/cards/royalDescent";
import { ryuukinSaxifrage } from "#src/services/gcg/cards/ryuukinSaxifrage";
import { searingGlare } from "#src/services/gcg/cards/searingGlare";
import { searingOnslaught } from "#src/services/gcg/cards/searingOnslaught";
import { signatureMix } from "#src/services/gcg/cards/signatureMix";
import { burningAssault } from "#src/services/gcg/cards/spiritOfOmenPyroScorpion";
import { spiritOfOmensAwakening } from "#src/services/gcg/cards/spiritOfOmensAwakening";
import { spiritOfOmensPower } from "#src/services/gcg/cards/spiritOfOmensPower";
import { springSpiritSummoning } from "#src/services/gcg/cards/springSpiritSummoning";
import { starwardSword } from "#src/services/gcg/cards/starwardSword";
import { stellarisPhantasm } from "#src/services/gcg/cards/stellarisPhantasm";
import { stellarRestoration, stellarRestorationFromCard } from "#src/services/gcg/cards/stellarRestoration";
import { sweepingTimeSkill } from "#src/services/gcg/cards/sweepingTimeSkill";
import { tenguStormcall } from "#src/services/gcg/cards/tenguStormcall";
import { tenkoKenshin } from "#src/services/gcg/cards/tenkoKenshin";
import { theMyriadWilds } from "#src/services/gcg/cards/theMyriadWilds";
import { tideAndTorrent } from "#src/services/gcg/cards/tideAndTorrent";
import { trumpCardKitty } from "#src/services/gcg/cards/trumpCardKitty";
import { yakanEvocation } from "#src/services/gcg/cards/yakanEvocation";

// Every character skill's own script, by the effect name the game gives the skill
export const GcgEffectNameSkillModuleMap: Map<string, GcgSkillModule> = new Map<string, GcgSkillModule>([
  ["Card_Vehicle_1230311", burningAssault],
  ["Char_Skill_11022", icyPaws],
  ["Char_Skill_11023", signatureMix],
  ["Char_Skill_11032", frostgnaw],
  ["Char_Skill_11033", glacialWaltz],
  ["Char_Skill_11042", chonghuasLayeredFrost],
  ["Char_Skill_11053", kamisatoArtSoumetsu],
  ["Char_Skill_11054", kamisatoArtSenhoSkill],
  ["Char_Skill_11072", springSpiritSummoning],
  ["Char_Skill_11073", divineMaidensDeliverance],
  ["Char_Skill_12022", fatalRainscreen],
  ["Char_Skill_12023", raincutter],
  ["Char_Skill_12032", mirrorReflectionOfDoom],
  ["Char_Skill_12033", stellarisPhantasm],
  ["Char_Skill_12034", illusoryTorrent],
  ["Char_Skill_12052", kurageOath],
  ["Char_Skill_12053", nereidsAscension],
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
  ["Char_Skill_14062", tenguStormcall],
  ["Char_Skill_14063", koukouSendou],
  ["Char_Skill_14082", yakanEvocation],
  ["Char_Skill_14083", tenkoKenshin],
  ["Char_Skill_15012", astableAnemohypostasisCreation],
  ["Char_Skill_15013", forbiddenCreation],
  ["Char_Skill_15022", galeBlade],
  ["Char_Skill_15023", dandelionBreeze],
  ["Char_Skill_15043", baneOfAllEvil],
  ["Char_Skill_16022", breastplate],
  ["Char_Skill_16023", sweepingTimeSkill],
  ["Char_Skill_16052", masatsuZetsugi],
  ["Char_Skill_16053", royalDescent],
  ["Char_Skill_16062", inuzakaAllRoundDefense],
  ["Char_Skill_16063", juugaForwardUntoVictory],
  ["Char_Skill_17012", floralBrush],
  ["Char_Skill_17013", trumpCardKitty],
  ["Char_Skill_22012", oceanidMimicSummoning],
  ["Char_Skill_22013", theMyriadWilds],
  ["Char_Skill_22014", tideAndTorrent],
  ["Char_Skill_23023", ominousStar],
  ["Char_Skill_23024", fieryRebirthSkill],
  ["Char_Skill_23031", searingGlare],
  ["Char_Skill_23032", blazingStrike],
  ["Char_Skill_23033", spiritOfOmensAwakening],
  ["Char_Skill_23034", spiritOfOmensPower],
  ["Char_Skill_24012", rockPaperScissorsCombo],
  ["Char_Skill_24013", lightningLockdown],
  ["Char_Skill_24014", electroCrystalCoreSkill],
  ["Char_Skill_24015", rockPaperScissorsScissors],
  ["Char_Skill_25012", blusteringBlade],
  ["Char_Skill_25013", frostyAssault],
  ["Char_Skill_26014", infusedStonehide],
  ["Char_Skill_30023", hide],
  ["Char_Skill_33024", flowfireEdgeSkill],
  ["Char_Skill_34063", elementalSedimentation],
]);
