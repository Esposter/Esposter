// The name each record a screen reads is held under, the keys of ScreenRecords
export const ScreenRecordKey = {
  CharacterTrials: "characterTrials",
  CookingTalents: "cookingTalents",
  CraftingRecipes: "craftingRecipes",
  CraftingStrongboxes: "craftingStrongboxes",
  Dishes: "dishes",
  DomainChallengeLevels: "domainChallengeLevels",
  ForgeRecipes: "forgeRecipes",
  HomeBlueprints: "homeBlueprints",
  PaimonsBargainsRotation: "paimonsBargainsRotation",
  ProcessingRecipes: "processingRecipes",
  ShopIdShopGoodMap: "shopIdShopGoodMap",
  WishSchedule: "wishSchedule",
} as const;
export type ScreenRecordKey = (typeof ScreenRecordKey)[keyof typeof ScreenRecordKey];
