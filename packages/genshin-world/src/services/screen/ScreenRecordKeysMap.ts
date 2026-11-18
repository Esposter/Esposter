import { ScreenKind } from "#src/models/screen/ScreenKind";
import { ScreenRecordKey } from "#src/models/screen/ScreenRecordKey";

// The records each screen reads as it opens. A screen with none is not listed
export const ScreenRecordKeysMap: Partial<Record<ScreenKind, readonly ScreenRecordKey[]>> = {
  [ScreenKind.Crafting]: [ScreenRecordKey.CraftingRecipes, ScreenRecordKey.CraftingStrongboxes],
  [ScreenKind.Inventory]: [ScreenRecordKey.CraftingRecipes, ScreenRecordKey.HomeBlueprints],
  [ScreenKind.PaimonsBargains]: [ScreenRecordKey.ShopIdShopGoodMap, ScreenRecordKey.PaimonsBargainsRotation],
  [ScreenKind.Shop]: [ScreenRecordKey.ShopIdShopGoodMap],
  [ScreenKind.Wish]: [ScreenRecordKey.WishSchedule],
};
