import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

import { readUiIndexEntries } from "#src/services/genshinAssets/ui/readUiIndexEntries";

// Every entry of a block's index, for a reader that needs the whole block at once
export const readUiBlockEntries = async (indexPath: string): Promise<UiIndexEntry[]> => {
  const entries: UiIndexEntry[] = [];
  for await (const entry of readUiIndexEntries(indexPath)) entries.push(entry);
  return entries;
};
