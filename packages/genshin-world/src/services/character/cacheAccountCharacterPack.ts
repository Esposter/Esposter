import type { AccountCharacterPack } from "#src/models/character/AccountCharacterPack";
import type { CharacterPack } from "#src/models/character/CharacterPack";

import { CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { readAccountCharacterPackFile } from "#src/services/character/readAccountCharacterPackFile";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The account's copy of a pack read whole into the shape the browser keeps it in, so the next load reads it from the
// Browser. Each file is read once, and a pack that does not read whole rejects, so a partial copy is never kept
export const cacheAccountCharacterPack = async (
  accountFileBaseUrl: string,
  { characterId, files, modelName, packHash }: AccountCharacterPack,
): Promise<CharacterPack> => {
  const fileEntries = await Promise.all(
    files.map(async ({ path }): Promise<[string, Blob]> => {
      const blob = await readAccountCharacterPackFile(accountFileBaseUrl, files, path);
      if (blob === undefined) throw new InvalidOperationError(Operation.Read, path, "is no file of the account's pack");
      return [path, blob];
    }),
  );
  const fileMap = new Map(fileEntries);
  const termsBlob = fileMap.get(CHARACTER_TERMS_PATH);
  if (termsBlob === undefined)
    throw new InvalidOperationError(Operation.Read, CHARACTER_TERMS_PATH, "is no file of the account's pack");
  return { characterId, files: fileMap, modelName, packHash, terms: await termsBlob.text() };
};
