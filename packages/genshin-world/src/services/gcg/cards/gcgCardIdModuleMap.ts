import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { aurousBlaze } from "#src/services/gcg/cards/aurousBlaze";
import { blessingOfTheDivineRelicsInstallation } from "#src/services/gcg/cards/blessingOfTheDivineRelicsInstallation";
import { brokenRimesEcho } from "#src/services/gcg/cards/brokenRimesEcho";
import { burningFlame } from "#src/services/gcg/cards/burningFlame";
import { calxsArts } from "#src/services/gcg/cards/calxsArts";
import { catalyzingField } from "#src/services/gcg/cards/catalyzingField";
import { changingShifts } from "#src/services/gcg/cards/changingShifts";
import { chonghuaFrostField } from "#src/services/gcg/cards/chonghuaFrostField";
import { crimsonWitchOfFlames } from "#src/services/gcg/cards/crimsonWitchOfFlames";
import { crossfire } from "#src/services/gcg/cards/crossfire";
import { dandelionField } from "#src/services/gcg/cards/dandelionField";
import { dawnWinery } from "#src/services/gcg/cards/dawnWinery";
import { dendroCore } from "#src/services/gcg/cards/dendroCore";
import { drunkenMist } from "#src/services/gcg/cards/drunkenMist";
import { elementalLifeformElectro } from "#src/services/gcg/cards/elementalLifeformElectro";
import { elementalResonanceWovenFlames } from "#src/services/gcg/cards/elementalResonanceWovenFlames";
import { ellin } from "#src/services/gcg/cards/ellin";
import { favoniusCathedral } from "#src/services/gcg/cards/favoniusCathedral";
import { flowfireEdge } from "#src/services/gcg/cards/flowfireEdge";
import { flowingFlame } from "#src/services/gcg/cards/flowingFlame";
import { guardiansOath } from "#src/services/gcg/cards/guardiansOath";
import { guoba } from "#src/services/gcg/cards/guoba";
import { icicle } from "#src/services/gcg/cards/icicle";
import { iHaventLostYet } from "#src/services/gcg/cards/iHaventLostYet";
import { illusoryBubble } from "#src/services/gcg/cards/illusoryBubble";
import { inspirationField } from "#src/services/gcg/cards/inspirationField";
import { ironTongueTian } from "#src/services/gcg/cards/ironTongueTian";
import { jadeChamber } from "#src/services/gcg/cards/jadeChamber";
import { jueyunGuoba } from "#src/services/gcg/cards/jueyunGuoba";
import { katheryne } from "#src/services/gcg/cards/katheryne";
import { largeWindSpirit } from "#src/services/gcg/cards/largeWindSpirit";
import { laurelCoronet } from "#src/services/gcg/cards/laurelCoronet";
import { leaveItToMe } from "#src/services/gcg/cards/leaveItToMe";
import { liyueHarborWharf } from "#src/services/gcg/cards/liyueHarborWharf";
import { magicGuide } from "#src/services/gcg/cards/magicGuide";
import { maskOfSolitudeBasalt } from "#src/services/gcg/cards/maskOfSolitudeBasalt";
import { masterOfWeaponry } from "#src/services/gcg/cards/masterOfWeaponry";
import { mintyMeatRolls } from "#src/services/gcg/cards/mintyMeatRolls";
import { mondstadtHashBrown } from "#src/services/gcg/cards/mondstadtHashBrown";
import { naganoharaMeteorSwarm } from "#src/services/gcg/cards/naganoharaMeteorSwarm";
import { niwabiEnshou } from "#src/services/gcg/cards/niwabiEnshou";
import { northernSmokedChicken } from "#src/services/gcg/cards/northernSmokedChicken";
import { oceanicMimicFrog } from "#src/services/gcg/cards/oceanicMimicFrog";
import { oceanicMimicRaptor } from "#src/services/gcg/cards/oceanicMimicRaptor";
import { oceanicMimicSquirrel } from "#src/services/gcg/cards/oceanicMimicSquirrel";
import { oz } from "#src/services/gcg/cards/oz";
import { paimon } from "#src/services/gcg/cards/paimon";
import { pyroInfusion } from "#src/services/gcg/cards/pyroInfusion";
import { pyronadoField } from "#src/services/gcg/cards/pyronadoField";
import { quickKnit } from "#src/services/gcg/cards/quickKnit";
import { ravenBow } from "#src/services/gcg/cards/ravenBow";
import { reflection } from "#src/services/gcg/cards/reflection";
import { sacrificialGreatsword } from "#src/services/gcg/cards/sacrificialGreatsword";
import { sendOff } from "#src/services/gcg/cards/sendOff";
import { shadowswordGallopingFrost } from "#src/services/gcg/cards/shadowswordGallopingFrost";
import { shadowswordLoneGale } from "#src/services/gcg/cards/shadowswordLoneGale";
import { starsigns } from "#src/services/gcg/cards/starsigns";
import { strategize } from "#src/services/gcg/cards/strategize";
import { streamingSurge } from "#src/services/gcg/cards/streamingSurge";
import { sweetMadame } from "#src/services/gcg/cards/sweetMadame";
import { theBestestTravelCompanion } from "#src/services/gcg/cards/theBestestTravelCompanion";
import { theWolfWithin } from "#src/services/gcg/cards/theWolfWithin";
import { thunderSummonersCrown } from "#src/services/gcg/cards/thunderSummonersCrown";
import { timmie } from "#src/services/gcg/cards/timmie";
import { transcendentAutomaton } from "#src/services/gcg/cards/transcendentAutomaton";
import { travelersHandySword } from "#src/services/gcg/cards/travelersHandySword";
import { tubby } from "#src/services/gcg/cards/tubby";
import { viridescentVenerersDiadem } from "#src/services/gcg/cards/viridescentVenerersDiadem";
import { wangshuInn } from "#src/services/gcg/cards/wangshuInn";
import { whenTheCraneReturned } from "#src/services/gcg/cards/whenTheCraneReturned";
import { whiteIronGreatsword } from "#src/services/gcg/cards/whiteIronGreatsword";
import { whiteTassel } from "#src/services/gcg/cards/whiteTassel";
import { wineStainedTricorne } from "#src/services/gcg/cards/wineStainedTricorne";
import { witchsScorchingHat } from "#src/services/gcg/cards/witchsScorchingHat";
import { GCG_BURNING_FLAME_ID, GCG_CATALYZING_FIELD_ID, GCG_DENDRO_CORE_ID } from "#src/services/gcg/constants";

// Every card a duel's module covers, by the card's id in the game's table
export const GcgCardIdModuleMap: Map<number, GcgCardModule> = new Map<number, GcgCardModule>([
  [111_023, drunkenMist],
  [111_031, icicle],
  [111041, chonghuaFrostField],
  [112_031, reflection],
  [112_032, illusoryBubble],
  [113_011, pyroInfusion],
  [113_021, guoba],
  [113_022, pyronadoField],
  [113_031, inspirationField],
  [113051, niwabiEnshou],
  [113052, aurousBlaze],
  [114_011, oz],
  [114021, theWolfWithin],
  [115_011, largeWindSpirit],
  [115_021, dandelionField],
  [122011, oceanicMimicSquirrel],
  [122012, oceanicMimicRaptor],
  [122013, oceanicMimicFrog],
  [125011, shadowswordLoneGale],
  [125012, shadowswordGallopingFrost],
  [133_021, flowfireEdge],
  [134_061, elementalLifeformElectro],
  [213_011, flowingFlame],
  [213_021, crossfire],
  [213051, naganoharaMeteorSwarm],
  [222011, streamingSurge],
  [225011, transcendentAutomaton],
  [311_101, magicGuide],
  [311201, ravenBow],
  [311301, whiteIronGreatsword],
  [311_302, sacrificialGreatsword],
  [311_401, whiteTassel],
  [311_501, travelersHandySword],
  [312101, brokenRimesEcho],
  [312_201, wineStainedTricorne],
  [312_301, witchsScorchingHat],
  [312_302, crimsonWitchOfFlames],
  [312401, thunderSummonersCrown],
  [312501, viridescentVenerersDiadem],
  [312_601, maskOfSolitudeBasalt],
  [312_701, laurelCoronet],
  [321001, liyueHarborWharf],
  [321_003, jadeChamber],
  [321_004, dawnWinery],
  [321005, wangshuInn],
  [321_006, favoniusCathedral],
  [322_001, paimon],
  [322002, katheryne],
  [322_006, tubby],
  [322_007, timmie],
  [322_010, ellin],
  [322011, ironTongueTian],
  [331_301, elementalResonanceWovenFlames],
  [332_001, theBestestTravelCompanion],
  [332_002, changingShifts],
  [332004, strategize],
  [332_005, iHaventLostYet],
  [332_006, leaveItToMe],
  [332_007, whenTheCraneReturned],
  [332_008, starsigns],
  [332_009, calxsArts],
  [332_010, masterOfWeaponry],
  [332_011, blessingOfTheDivineRelicsInstallation],
  [332_012, quickKnit],
  [332_013, sendOff],
  [332_014, guardiansOath],
  [333001, jueyunGuoba],
  [333004, northernSmokedChicken],
  [333_005, sweetMadame],
  [333_006, mondstadtHashBrown],
  [333_008, mintyMeatRolls],
  [GCG_BURNING_FLAME_ID, burningFlame],
  [GCG_CATALYZING_FIELD_ID, catalyzingField],
  [GCG_DENDRO_CORE_ID, dendroCore],
]);
