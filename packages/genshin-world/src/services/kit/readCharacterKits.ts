import type { Kit } from "#src/models/kit/Kit";

import { readCharacterKit } from "#src/services/kit/readCharacterKit";

// The kits of the characters given, by character id, each read and built once as the character joins the party
export const readCharacterKits = async (
  gameDataBaseUrl: string,
  characterIds: readonly number[],
): Promise<Map<number, Kit>> =>
  new Map(
    await Promise.all(
      characterIds.map(
        async (characterId) => [characterId, await readCharacterKit(gameDataBaseUrl, characterId)] as const,
      ),
    ),
  );
