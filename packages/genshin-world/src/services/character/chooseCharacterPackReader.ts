import type { CharacterPackReader } from "#src/models/character/CharacterPackReader";
import type { CharacterPackSources } from "#src/models/character/CharacterPackSources";

import { CHARACTER_PACK_FETCH_TIMEOUT_MS } from "#src/services/character/constants";
import { readCharacterPackFile } from "#src/services/character/readCharacterPackFile";
import { ID_SEPARATOR } from "@esposter/shared";

// Where a character's pack is read from: the pack the browser keeps for it, which a player loaded, then the host's,
// Where the host's index lists the character. With neither the character has no pack, and is drawn as its body's
// Capsule without a request
export const chooseCharacterPackReader = (
  characterId: number,
  { characterIdPackHashMap, characterPackBaseUrl, characterPackStore, hostCharacterPackIds }: CharacterPackSources,
): CharacterPackReader | undefined => {
  const packHash = characterIdPackHashMap.get(characterId);
  if (characterPackStore && packHash !== undefined) {
    const storedCharacterPack = { characterId, packHash };
    return {
      key: [characterId, packHash].join(ID_SEPARATOR),
      readFile: (path) => characterPackStore.readFile(storedCharacterPack, path),
    };
  }

  if (characterPackBaseUrl && hostCharacterPackIds.has(characterId))
    return {
      key: [characterPackBaseUrl, characterId].join(ID_SEPARATOR),
      readFile: async (path) => {
        const response = await readCharacterPackFile(
          characterPackBaseUrl,
          characterId,
          path,
          CHARACTER_PACK_FETCH_TIMEOUT_MS,
        );
        return response.blob();
      },
    };
  return undefined;
};
