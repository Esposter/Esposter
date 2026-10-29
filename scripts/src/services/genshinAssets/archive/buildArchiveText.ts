import type { ArchiveEntry } from "genshin-world";

import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { GameLanguages } from "genshin-text";
import { GameDataset } from "genshin-world";

// The name and the description of every entry the Archive's built sections cite, in every language, published into the
// World's own chunk per language by the same text ids, as `genshin:assets achievements` publishes its titles
export const buildArchiveText = (
  archiveObjects: Record<string, readonly ArchiveEntry[]>,
): { notes: string[]; objects: Record<string, unknown> } => {
  const textIds = [
    ...new Set(
      Object.values(archiveObjects)
        .flat()
        .flatMap(({ descriptionTextId, nameTextId }) =>
          descriptionTextId === undefined ? [nameTextId] : [nameTextId, descriptionTextId],
        ),
    ),
  ].toSorted();
  const { notes, objects } = buildTextChunks(GameDataset.ArchiveText, textIds);
  notes.push(`${textIds.length} archive texts written in ${GameLanguages.length} languages`);
  return { notes, objects };
};
