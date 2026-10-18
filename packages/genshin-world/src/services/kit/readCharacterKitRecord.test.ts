import type { KitHitRecord } from "#src/models/kit/record/KitHitRecord";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GameDataset } from "#src/models/data/GameDataset";
import { kitRecordSchema } from "#src/models/kit/record/KitRecord";
import { COMBAT_TALENT_ORDER, TALENT_START_LEVELS } from "#src/services/character/constants";
import { readCharacterTalentKits } from "#src/services/character/readCharacterTalentKits";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { createKitRecordResolver } from "#src/services/kit/build/createKitRecordResolver";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe } from "vitest";

// A character's hosted kit record read through the local mirror, with readers for its frames and hits, and the
// Resolver its kit resolves the record's parameters with: each parameter read off its talent's table at the level the
// Talent starts at, as `readCharacterKit` plays it
export const readCharacterKitRecord = async (characterId: number) => {
  const [record, talentMultiplierMap, characterTalentKits] = await Promise.all([
    readGameDataEntry(GAME_DATA_LOCAL_BASE_URL, GameDataset.Kits, String(characterId), kitRecordSchema),
    readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [characterId]),
    readCharacterTalentKits(GAME_DATA_LOCAL_BASE_URL),
  ]);
  const talentGroupIds = characterTalentKits.find(
    ({ characterId: talentKitCharacterId }) => talentKitCharacterId === characterId,
  )?.talentGroupIds;
  if (!talentGroupIds) throw new InvalidOperationError(Operation.Read, `${characterId}`, "no talent groups");
  const { toParameter } = createKitRecordResolver(
    talentMultiplierMap,
    Object.fromEntries(COMBAT_TALENT_ORDER.map((talent) => [talentGroupIds[talent], TALENT_START_LEVELS[talent]])),
  );
  // A frame count of the record, which its kit plays in seconds
  const readFrame = (name: string): number => {
    const frame = record.frames?.[name];
    if (typeof frame !== "number")
      throw new InvalidOperationError(Operation.Read, name, "is not a frame count of the record");
    return frame;
  };
  // A list of frame counts of the record, such as the frames a spawn repeats at
  const readFrameList = (name: string): number[] => {
    const frames = record.frames?.[name];
    if (!Array.isArray(frames)) throw new InvalidOperationError(Operation.Read, name, "is not a list of the record");
    return frames;
  };
  // The hits a name of the record holds, which may be one hit or a list of them
  const readHits = (name: string): KitHitRecord[] => {
    const hits = record.hits?.[name];
    if (hits === undefined) throw new InvalidOperationError(Operation.Read, name, "is not a hit of the record");
    return Array.isArray(hits) ? hits : [hits];
  };
  return { readFrame, readFrameList, readHits, record, toParameter };
};

describe.todo("readCharacterKitRecord");
