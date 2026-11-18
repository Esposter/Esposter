// The name each record a screen reads is held under, the keys of ScreenRecords
export const ScreenRecordKey = {
  CharacterTrials: "characterTrials",
  CraftingRecipes: "craftingRecipes",
  CraftingStrongboxes: "craftingStrongboxes",
  Dishes: "dishes",
  DomainChallengeLevels: "domainChallengeLevels",
  HomeBlueprints: "homeBlueprints",
  PaimonsBargainsRotation: "paimonsBargainsRotation",
  ShopIdShopGoodMap: "shopIdShopGoodMap",
  WishSchedule: "wishSchedule",
} as const;
export type ScreenRecordKey = (typeof ScreenRecordKey)[keyof typeof ScreenRecordKey];
