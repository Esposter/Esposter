// One row of the game's character table: an id a dialog's speaker names, and its name by text hash
export interface DumpedNpc {
  id: number;
  // Marked on the rows of the NPCs that stand for an object to act on, such as the crafting bench, and absent on the rest
  invisiable?: boolean;
  nameTextMapHash: number;
}
