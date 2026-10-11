import type { CharacterPack } from "#src/models/character/CharacterPack";
import type { PickedCharacterPack } from "#src/models/character/PickedCharacterPack";

import { readPickedCharacterPack } from "#src/services/character/readPickedCharacterPack";
import { getResultAsync } from "@esposter/shared";

// The releases a player picked together, each read into its pack. A release that fails is reported by its name and
// Skipped, so one release that matches no character or lacks its model never stops the rest from being read
export const readPickedCharacterPacks = async (
  pickedCharacterPacks: readonly PickedCharacterPack[],
  characterIdNamesMap: ReadonlyMap<number, readonly string[]>,
  characterId: number,
): Promise<{ characterPacks: CharacterPack[]; failures: string[] }> => {
  const results = await Promise.all(
    pickedCharacterPacks.map((pickedCharacterPack) =>
      getResultAsync(() => readPickedCharacterPack(pickedCharacterPack, characterIdNamesMap, characterId)).match(
        (characterPack) => ({ characterPack }),
        (error) => {
          console.error(error);
          return { failure: `${pickedCharacterPack.name}: ${error.message}` };
        },
      ),
    ),
  );
  return {
    characterPacks: results.flatMap((result) => ("characterPack" in result ? [result.characterPack] : [])),
    failures: results.flatMap((result) => ("failure" in result ? [result.failure] : [])),
  };
};
