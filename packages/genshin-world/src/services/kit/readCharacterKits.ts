import type { TalentLevels } from "#src/models/character/TalentLevels";
import type { Kit } from "#src/models/kit/Kit";

import { readCharacterKit } from "#src/services/kit/readCharacterKit";

// The kits of the characters given, by character id, each read and built once as the character joins the party, playing
// Each talent at the levels given for its character
export const readCharacterKits = async (
  gameDataBaseUrl: string,
  characterTalentLevelMap: ReadonlyMap<number, TalentLevels>,
): Promise<Map<number, Kit>> =>
  new Map(
    await Promise.all(
      Array.from(
        characterTalentLevelMap,
        async ([characterId, talentLevels]) =>
          [characterId, await readCharacterKit(gameDataBaseUrl, characterId, talentLevels)] as const,
      ),
    ),
  );
