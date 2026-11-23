import type { ScreenRecords } from "#src/models/screen/ScreenRecords";

import { ScreenRecordKey } from "#src/models/screen/ScreenRecordKey";
import { readCookingTalents } from "#src/services/cooking/readCookingTalents";
import { readDishes } from "#src/services/cooking/readDishes";
import { readProcessingRecipes } from "#src/services/cooking/readProcessingRecipes";
import { readCraftingRecipes } from "#src/services/crafting/readCraftingRecipes";
import { readCraftingStrongboxes } from "#src/services/crafting/readCraftingStrongboxes";
import { readDomainChallengeLevels } from "#src/services/domains/readDomainChallengeLevels";
import { readForgeDailyPointCap } from "#src/services/forging/readForgeDailyPointCap";
import { readForgeRecipes } from "#src/services/forging/readForgeRecipes";
import { readHomeBlueprints } from "#src/services/home/readHomeBlueprints";
import { readPaimonsBargainsRotation } from "#src/services/shop/readPaimonsBargainsRotation";
import { readShopGoodMap } from "#src/services/shop/readShopGoodMap";
import { readCharacterTrials } from "#src/services/trial/readCharacterTrials";
import { readWishSchedule } from "#src/services/wish/readWishSchedule";

// Each record's reader, by its key, which reads it from the game data's base
export const ScreenRecordLoaderMap: {
  [K in ScreenRecordKey]: (gameDataBaseUrl: string) => Promise<ScreenRecords[K]>;
} = {
  [ScreenRecordKey.CharacterTrials]: readCharacterTrials,
  [ScreenRecordKey.CookingTalents]: readCookingTalents,
  [ScreenRecordKey.CraftingRecipes]: readCraftingRecipes,
  [ScreenRecordKey.CraftingStrongboxes]: readCraftingStrongboxes,
  [ScreenRecordKey.Dishes]: readDishes,
  [ScreenRecordKey.DomainChallengeLevels]: readDomainChallengeLevels,
  [ScreenRecordKey.ForgeDailyPointCap]: readForgeDailyPointCap,
  [ScreenRecordKey.ForgeRecipes]: readForgeRecipes,
  [ScreenRecordKey.HomeBlueprints]: readHomeBlueprints,
  [ScreenRecordKey.PaimonsBargainsRotation]: readPaimonsBargainsRotation,
  [ScreenRecordKey.ProcessingRecipes]: readProcessingRecipes,
  [ScreenRecordKey.ShopIdShopGoodMap]: readShopGoodMap,
  [ScreenRecordKey.WishSchedule]: readWishSchedule,
};
