// What an entry of the bag holds, which its save tells apart by its kind: a stack of an item, or one artifact or weapon of
// Its own. A weapon's entry holds its state, an artifact's the artifact as it was rolled, and a stack neither
export const InventoryItemKind = { Artifact: "artifact", Stack: "stack", Weapon: "weapon" } as const;
export type InventoryItemKind = (typeof InventoryItemKind)[keyof typeof InventoryItemKind];
