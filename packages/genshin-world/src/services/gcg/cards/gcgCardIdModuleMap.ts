import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { burningFlame } from "#src/services/gcg/cards/burningFlame";
import { catalyzingField } from "#src/services/gcg/cards/catalyzingField";
import { crimsonWitchOfFlames } from "#src/services/gcg/cards/crimsonWitchOfFlames";
import { dendroCore } from "#src/services/gcg/cards/dendroCore";
import { elementalResonanceWovenFlames } from "#src/services/gcg/cards/elementalResonanceWovenFlames";
import { ellin } from "#src/services/gcg/cards/ellin";
import { favoniusCathedral } from "#src/services/gcg/cards/favoniusCathedral";
import { flowingFlame } from "#src/services/gcg/cards/flowingFlame";
import { illusoryBubble } from "#src/services/gcg/cards/illusoryBubble";
import { inspirationField } from "#src/services/gcg/cards/inspirationField";
import { jadeChamber } from "#src/services/gcg/cards/jadeChamber";
import { mondstadtHashBrown } from "#src/services/gcg/cards/mondstadtHashBrown";
import { paimon } from "#src/services/gcg/cards/paimon";
import { pyroInfusion } from "#src/services/gcg/cards/pyroInfusion";
import { reflection } from "#src/services/gcg/cards/reflection";
import { sacrificialGreatsword } from "#src/services/gcg/cards/sacrificialGreatsword";
import { starsigns } from "#src/services/gcg/cards/starsigns";
import { theBestestTravelCompanion } from "#src/services/gcg/cards/theBestestTravelCompanion";
import { timmie } from "#src/services/gcg/cards/timmie";
import { whenTheCraneReturned } from "#src/services/gcg/cards/whenTheCraneReturned";
import { wineStainedTricorne } from "#src/services/gcg/cards/wineStainedTricorne";
import { witchsScorchingHat } from "#src/services/gcg/cards/witchsScorchingHat";
import { GCG_BURNING_FLAME_ID, GCG_CATALYZING_FIELD_ID, GCG_DENDRO_CORE_ID } from "#src/services/gcg/constants";

// Every card a duel's module covers, by the card's id in the game's table
export const GcgCardIdModuleMap: Map<number, GcgCardModule> = new Map<number, GcgCardModule>([
  [GCG_BURNING_FLAME_ID, burningFlame],
  [GCG_DENDRO_CORE_ID, dendroCore],
  [GCG_CATALYZING_FIELD_ID, catalyzingField],
  [113_011, pyroInfusion],
  [112_031, reflection],
  [112_032, illusoryBubble],
  [113_031, inspirationField],
  [213_011, flowingFlame],
  [311_302, sacrificialGreatsword],
  [312_201, wineStainedTricorne],
  [312_301, witchsScorchingHat],
  [312_302, crimsonWitchOfFlames],
  [321_003, jadeChamber],
  [321_006, favoniusCathedral],
  [322_001, paimon],
  [322_007, timmie],
  [322_010, ellin],
  [331_301, elementalResonanceWovenFlames],
  [332_001, theBestestTravelCompanion],
  [332_007, whenTheCraneReturned],
  [332_008, starsigns],
  [333_006, mondstadtHashBrown],
]);
