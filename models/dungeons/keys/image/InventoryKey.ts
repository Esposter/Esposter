export const InventoryKey = {
  Bag: "Bag",
  InventoryBackground: "InventoryBackground",
} as const;
export type InventoryKey = keyof typeof InventoryKey;
