import type { Tip } from "genshin-world";

import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { GameLanguages } from "genshin-text";
import { GameDataset } from "genshin-world";

// The title and subtitle of every tip, in every language, published into the world's own chunk per language by the text
// Ids, as the Archive's names are
export const buildTipText = (tips: readonly Tip[]): { notes: string[]; objects: Record<string, unknown> } => {
  const textIds = [
    ...new Set(tips.flatMap(({ subtitleTextId, titleTextId }) => [titleTextId, subtitleTextId])),
  ].toSorted();
  const { notes, objects } = buildTextChunks(GameDataset.TipText, textIds);
  notes.push(`${textIds.length} tip texts written in ${GameLanguages.length} languages`);
  return { notes, objects };
};
