import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

// The entries no other entry of their container names as its father: a container's roots.
// Pieces whose father's dump is lost read as roots too, rather than vanishing
export const getUiRootEntries = (entries: readonly UiIndexEntry[]): UiIndexEntry[] => {
  const transformIds = new Set(entries.map(({ transformId }) => transformId));
  return entries.filter(({ fatherId }) => !fatherId || !transformIds.has(fatherId));
};
