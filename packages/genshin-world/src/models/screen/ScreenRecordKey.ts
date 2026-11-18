// The name each record a screen reads is held under, the keys of ScreenRecords
export const ScreenRecordKey = {
  CraftingRecipes: "craftingRecipes",
  CraftingStrongboxes: "craftingStrongboxes",
  HomeBlueprints: "homeBlueprints",
} as const;
export type ScreenRecordKey = (typeof ScreenRecordKey)[keyof typeof ScreenRecordKey];
