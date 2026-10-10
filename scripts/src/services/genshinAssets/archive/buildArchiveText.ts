import type { ArchiveEntry } from "genshin-world";

import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { GameLanguages } from "genshin-text";
import { GameDataset } from "genshin-world";

// The name of every entry the Archive's built sections cite, in every language, published into the world's own chunk per
// Language by the same text ids, as `genshin:assets achievements` publishes its titles
export const buildArchiveText = (
  archiveObjects: Record<string, readonly ArchiveEntry[]>,
): { notes: string[]; objects: Record<string, unknown> } => {
  const textIds = [
    ...new Set(
      Object.values(archiveObjects)
        .flat()
        .map(({ nameTextId }) => nameTextId),
    ),
  ].toSorted();
  const { notes, objects } = buildTextChunks(GameDataset.ArchiveText, textIds);
  notes.push(`${textIds.length} archive names written in ${GameLanguages.length} languages`);
  return { notes, objects };
};
