// What the weapons' and artifacts' tabs sort by, the two choices the game's sort offers
export const InventorySort = { Level: "Level", Quality: "Quality" } as const;
export type InventorySort = (typeof InventorySort)[keyof typeof InventorySort];

export const InventorySorts: readonly InventorySort[] = Object.values(InventorySort);
