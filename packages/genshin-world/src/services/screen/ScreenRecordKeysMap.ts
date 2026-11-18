import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ScreenRecordKey } from "#src/models/screen/ScreenRecordKey";

// The records each screen reads as it opens. A screen with none is not listed
export const ScreenRecordKeysMap: Partial<Record<ScreenKind, readonly ScreenRecordKey[]>> = {
  [ScreenKind.Domain]: [ScreenRecordKey.DomainChallengeLevels],
  [ScreenKind.Cooking]: [ScreenRecordKey.CookingTalents],
  [ScreenKind.Crafting]: [ScreenRecordKey.CraftingRecipes, ScreenRecordKey.CraftingStrongboxes],
  [ScreenKind.Forge]: [ScreenRecordKey.ForgeRecipes],
  [ScreenKind.Inventory]: [
    ScreenRecordKey.CraftingRecipes,
    ScreenRecordKey.Dishes,
    ScreenRecordKey.ForgeRecipes,
    ScreenRecordKey.HomeBlueprints,
  ],
  [ScreenKind.PaimonsBargains]: [ScreenRecordKey.ShopIdShopGoodMap, ScreenRecordKey.PaimonsBargainsRotation],
  [ScreenKind.Processing]: [ScreenRecordKey.ProcessingRecipes],
  [ScreenKind.Shop]: [ScreenRecordKey.ShopIdShopGoodMap],
  [ScreenKind.Wish]: [ScreenRecordKey.WishSchedule, ScreenRecordKey.CharacterTrials],
};
