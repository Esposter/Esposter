import type { EntryChange } from "#src/models/gameData/EntryChange";

export interface EntryDiff {
  addedCount: number;
  changes: EntryChange[];
  removedCount: number;
}
