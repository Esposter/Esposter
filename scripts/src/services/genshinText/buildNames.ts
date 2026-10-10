import { buildTextChunks } from "#src/services/genshinText/buildTextChunks";
import { readNameTextIds } from "#src/services/genshinText/readNameTextIds";
import { GameLanguages } from "genshin-text";
import { GameDataset } from "genshin-world";

// Every name the world's data cites by text id is published into the world's own chunk per language. The ids are every
// `nameTextId` in the published records and the data files, found by `readNameTextIds`, so a new source needs no entry here
export const buildNames = async (): Promise<{ notes: string[]; objects: Record<string, unknown> }> => {
  const textIds = await readNameTextIds();
  const { notes, objects } = buildTextChunks(GameDataset.NameText, textIds);
  notes.push(`${textIds.length} names written in ${GameLanguages.length} languages`);
  return { notes, objects };
};
