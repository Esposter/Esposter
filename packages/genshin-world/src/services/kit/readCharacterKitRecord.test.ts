import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GameDataset } from "#src/models/data/GameDataset";
import { kitRecordSchema } from "#src/models/kit/record/KitRecord";
import { COMBAT_TALENT_ORDER, TALENT_START_LEVELS } from "#src/services/character/constants";
import { readCharacterTalentKits } from "#src/services/character/readCharacterTalentKits";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { createKitRecordResolver } from "#src/services/kit/build/createKitRecordResolver";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character's hosted kit record read through the local mirror, and the resolver its kit resolves the record's parameters
// With: each parameter read off its talent's table at the level the talent starts at, as `readCharacterKit` plays it
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
  return { record, toParameter };
};
