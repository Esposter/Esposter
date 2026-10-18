import type { CraftingCell } from "genshin-interface";

// The party's characters who can craft, each named by the game's own text, and the crafter picked as the bench opens: the
// Character on the field, whose talent may pass a craft's extra on to the bag
export const computeCraftingCrafters = (
  characterIds: readonly number[],
  activeCharacterId: number,
  nameOf: (characterId: number) => string,
): { crafterId: number; crafters: CraftingCell[] } => ({
  crafterId: activeCharacterId,
  crafters: characterIds.map((id) => ({ id, name: nameOf(id) })),
});
