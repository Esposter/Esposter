import type { CharacterPack } from "#src/models/character/CharacterPack";
import type { PickedCharacterPack } from "#src/models/character/PickedCharacterPack";

import { readPickedCharacterPack } from "#src/services/character/readPickedCharacterPack";
import { settleEachNamed } from "#src/services/shared/settleEachNamed";

// The releases a player picked together, each read into its pack. A release that fails is reported by its name and
// Skipped, so one release that matches no character or lacks its model never stops the rest from being read
export const readPickedCharacterPacks = async (
  pickedCharacterPacks: readonly PickedCharacterPack[],
  characterIdNamesMap: ReadonlyMap<number, readonly string[]>,
  characterId: number,
): Promise<{ characterPacks: CharacterPack[]; failures: string[] }> => {
  const { failures, values } = await settleEachNamed(
    pickedCharacterPacks,
    ({ name }) => name,
    (pickedCharacterPack) => readPickedCharacterPack(pickedCharacterPack, characterIdNamesMap, characterId),
  );
  return { characterPacks: values, failures };
};
