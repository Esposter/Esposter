export const ChestObjectProperty = {
  ItemId: "itemId",
} as const;
export type ChestObjectProperty = (typeof ChestObjectProperty)[keyof typeof ChestObjectProperty];
