import type { CharacterScale, CharacterScaleRecord } from "genshin-world";

import { publishGameDataStep } from "#src/services/gameData/publishGameDataStep";
import { readGameDataLock } from "#src/services/gameData/readGameDataLock";
import { readPublishedGameData } from "#src/services/gameData/readPublishedGameData";
import { characterScaleRecordSchema, GameDataset } from "genshin-world";

// The one record of the characters' measured scales, under the key the world reads it by
const CHARACTER_SCALE_KEY = `${GameDataset.Characters}/scale` as const;

// The record the lock holds, or an empty one where no publish has written it yet
const readHeldCharacterScaleRecord = async (): Promise<CharacterScaleRecord> => {
  const { objects } = await readGameDataLock();
  if (objects[CHARACTER_SCALE_KEY] === undefined) return {};
  return characterScaleRecordSchema.parse(await readPublishedGameData(CHARACTER_SCALE_KEY));
};

// Publishes one character's scale into the record, keeping the scales of the other characters the lock already holds.
// A dry run reports the change and stores nothing
export const publishCharacterScale = async (
  characterId: number,
  scale: CharacterScale,
  isDryRun: boolean,
): Promise<string> => {
  const scaleRecord = { ...(await readHeldCharacterScaleRecord()), [String(characterId)]: scale };
  return publishGameDataStep({
    isDryRun,
    publication: { indexes: {}, objects: { [CHARACTER_SCALE_KEY]: scaleRecord } },
    scopes: [CHARACTER_SCALE_KEY],
  });
};
