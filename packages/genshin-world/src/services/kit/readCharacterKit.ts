import type { Kit } from "#src/models/kit/Kit";

import { CharacterIdCreateKitBehaviourMap } from "#src/generated/characterKitMap/CharacterIdCreateKitBehaviourMap";
import { GameDataset } from "#src/models/data/GameDataset";
import { kitRecordSchema } from "#src/models/kit/record/KitRecord";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { buildKit } from "#src/services/kit/buildKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKitBehaviour } from "#src/services/kit/travelerKit";

// A character's kit, built once from its record, its talent multipliers and its behaviour module, the three read on
// Demand together. A character with no module of its own fights with the Traveler's kit, from the Traveler's record,
// Multipliers and behaviour
export const readCharacterKit = async (gameDataBaseUrl: string, characterId: number): Promise<Kit> => {
  const loadCreateBehaviour = CharacterIdCreateKitBehaviourMap[characterId];
  const kitCharacterId = loadCreateBehaviour ? characterId : TRAVELER_CHARACTER_ID;
  const [createBehaviour, talentMultiplierMap, record] = await Promise.all([
    loadCreateBehaviour ? loadCreateBehaviour() : createTravelerKitBehaviour,
    readTalentMultipliers(gameDataBaseUrl, [kitCharacterId]),
    readGameDataEntry(gameDataBaseUrl, GameDataset.Kits, String(kitCharacterId), kitRecordSchema),
  ]);
  return buildKit(record, talentMultiplierMap, createBehaviour);
};
