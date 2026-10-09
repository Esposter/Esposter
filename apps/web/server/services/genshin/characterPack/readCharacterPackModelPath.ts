import { parsePmx } from "genshin-engine";
import { chooseCharacterPackModel, readCharacterNames } from "genshin-world/characterPack";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The model a character's folder draws it with, by its path in the folder: its one .pmx, or of several the one whose
// Header names it as the character, whose names are read from the hosted game data for such a folder alone
export const readCharacterPackModelPath = (
  folder: string,
  filePaths: readonly string[],
  characterId: number,
  gameDataBaseUrl: string,
): Promise<string> =>
  chooseCharacterPackModel(
    folder,
    filePaths,
    async (filePath) => parsePmx(new Uint8Array(await readFile(join(folder, filePath))).buffer).name,
    () => readCharacterNames(gameDataBaseUrl, characterId),
  );
