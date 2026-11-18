import type { ScreenRecords } from "#src/models/screen/ScreenRecords";

import { ScreenRecordKey } from "#src/models/screen/ScreenRecordKey";
import { readCharacterTrials } from "#src/services/trial/readCharacterTrials";
import { readCraftingRecipes } from "#src/services/crafting/readCraftingRecipes";
import { readCraftingStrongboxes } from "#src/services/crafting/readCraftingStrongboxes";
import { readCookingTalents } from "#src/services/cooking/readCookingTalents";
import { readDishes } from "#src/services/cooking/readDishes";
import { readProcessingRecipes } from "#src/services/cooking/readProcessingRecipes";
import { readDomainChallengeLevels } from "#src/services/domains/readDomainChallengeLevels";
import { readForgeRecipes } from "#src/services/forging/readForgeRecipes";
import { readHomeBlueprints } from "#src/services/home/readHomeBlueprints";
import { readPaimonsBargainsRotation } from "#src/services/shop/readPaimonsBargainsRotation";
import { readShopGoodMap } from "#src/services/shop/readShopGoodMap";
import { readWishSchedule } from "#src/services/wish/readWishSchedule";

// Each record's reader, by its key, which reads it from the game data's base
export const ScreenRecordLoaderMap: {
  [K in ScreenRecordKey]: (gameDataBaseUrl: string) => Promise<ScreenRecords[K]>;
} = {
  [ScreenRecordKey.CharacterTrials]: readCharacterTrials,
  [ScreenRecordKey.CraftingRecipes]: readCraftingRecipes,
  [ScreenRecordKey.CraftingStrongboxes]: readCraftingStrongboxes,
  [ScreenRecordKey.CookingTalents]: readCookingTalents,
  [ScreenRecordKey.Dishes]: readDishes,
  [ScreenRecordKey.ForgeRecipes]: readForgeRecipes,
  [ScreenRecordKey.DomainChallengeLevels]: readDomainChallengeLevels,
  [ScreenRecordKey.HomeBlueprints]: readHomeBlueprints,
  [ScreenRecordKey.ProcessingRecipes]: readProcessingRecipes,
  [ScreenRecordKey.ShopIdShopGoodMap]: readShopGoodMap,
  [ScreenRecordKey.PaimonsBargainsRotation]: readPaimonsBargainsRotation,
  [ScreenRecordKey.WishSchedule]: readWishSchedule,
};
