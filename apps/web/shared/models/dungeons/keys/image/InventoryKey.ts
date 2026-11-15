export const InventoryKey = { Bag: "Bag", InventoryBackground: "InventoryBackground" } as const;
export type InventoryKey = (typeof InventoryKey)[keyof typeof InventoryKey];
