import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { CharacterPackSources } from "#src/models/character/CharacterPackSources";

import { CHARACTER_PACK_FETCH_TIMEOUT_MS } from "#src/services/character/constants";
import { readAccountCharacterPackFile } from "#src/services/character/readAccountCharacterPackFile";
import { readCharacterPackFile } from "#src/services/character/readCharacterPackFile";
import { ID_SEPARATOR } from "@esposter/shared";

// Where a character's pack is read from, in order: the pack the browser keeps for it, unless the player's account lists
// Another hash for the character, then the account's copy, then the host's, where the host's index lists the character.
// With none the character has no pack, and is drawn as its body's capsule without a request
export const chooseCharacterPackReader = (
  characterId: number,
  {
    accountCharacterPacks,
    accountFileBaseUrl,
    characterIdPackHashMap,
    characterPackBaseUrl,
    characterPackStore,
    hostCharacterPackIds,
  }: CharacterPackSources,
): CharacterPackReader | undefined => {
  const packHash = characterIdPackHashMap.get(characterId);
  const accountCharacterPack = accountCharacterPacks.find((accountPack) => accountPack.characterId === characterId);
  const isKeptPackCurrent = accountCharacterPack === undefined || accountCharacterPack.packHash === packHash;
  if (characterPackStore && packHash !== undefined && isKeptPackCurrent) {
    const storedCharacterPack = { characterId, packHash };
    return {
      characterId,
      key: [characterId, packHash].join(ID_SEPARATOR),
      readFile: (path) => characterPackStore.readFile(storedCharacterPack, path),
    };
  }

  if (accountFileBaseUrl && accountCharacterPack)
    return {
      characterId,
      key: [characterId, accountCharacterPack.packHash].join(ID_SEPARATOR),
      readFile: (path) => readAccountCharacterPackFile(accountFileBaseUrl, accountCharacterPack.files, path),
    };

  if (characterPackBaseUrl && hostCharacterPackIds.has(characterId))
    return {
      characterId,
      key: [characterPackBaseUrl, characterId].join(ID_SEPARATOR),
      readFile: async (path) => {
        const response = await readCharacterPackFile(
          characterPackBaseUrl,
          characterId,
          path,
          CHARACTER_PACK_FETCH_TIMEOUT_MS,
        );
        return response?.blob();
      },
    };
  return undefined;
};
