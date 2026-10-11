import type { AccountCharacterPackFile } from "#src/models/character/AccountCharacterPackFile";

import { CHARACTER_PACK_FETCH_TIMEOUT_MS } from "#src/services/character/constants";
import { getCharacterPackFilePath } from "#src/services/character/getCharacterPackFilePath";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A file of the player's account's pack, by the path the layout serves it at, from the same-origin route that serves the
// Account's own files by their hash, the cookie of the player's session being all it is asked for. A path the pack holds
// No file at is absent with no request; a file it lists that does not arrive rejects
export const readAccountCharacterPackFile = async (
  accountFileBaseUrl: string,
  files: readonly AccountCharacterPackFile[],
  path: string,
): Promise<Blob | undefined> => {
  const filePath = getCharacterPackFilePath(path);
  const file = files.find((accountFile) => accountFile.path === filePath);
  if (file === undefined) return undefined;
  const url = `${accountFileBaseUrl}/${file.sha256}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(CHARACTER_PACK_FETCH_TIMEOUT_MS) });
  if (!response.ok)
    throw new InvalidOperationError(Operation.Read, url, `HTTP ${response.status} ${response.statusText}`);
  return response.blob();
};
