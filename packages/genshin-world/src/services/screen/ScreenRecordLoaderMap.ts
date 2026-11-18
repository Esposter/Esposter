import type { ScreenRecords } from "#src/models/screen/ScreenRecords";

import { ScreenRecordKey } from "#src/models/screen/ScreenRecordKey";
import { readCharacterTrials } from "#src/services/trial/readCharacterTrials";
import { readCraftingRecipes } from "#src/services/crafting/readCraftingRecipes";
import { readCraftingStrongboxes } from "#src/services/crafting/readCraftingStrongboxes";
import { readDishes } from "#src/services/cooking/readDishes";
import { readDomainChallengeLevels } from "#src/services/domains/readDomainChallengeLevels";
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
  [ScreenRecordKey.Dishes]: readDishes,
  [ScreenRecordKey.DomainChallengeLevels]: readDomainChallengeLevels,
  [ScreenRecordKey.HomeBlueprints]: readHomeBlueprints,
  [ScreenRecordKey.ShopIdShopGoodMap]: readShopGoodMap,
  [ScreenRecordKey.PaimonsBargainsRotation]: readPaimonsBargainsRotation,
  [ScreenRecordKey.WishSchedule]: readWishSchedule,
};
