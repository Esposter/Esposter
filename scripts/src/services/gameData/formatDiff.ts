import type { EntryDiff } from "#src/models/gameData/EntryDiff";

export const formatDiff = ({ addedCount, changes, removedCount }: EntryDiff): string =>
  `+${addedCount} -${removedCount} ~${changes.length}`;
