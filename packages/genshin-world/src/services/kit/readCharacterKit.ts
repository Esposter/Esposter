import type { Kit } from "#src/models/kit/Kit";

import { CharacterIdCreateKitBehaviourMap } from "#src/generated/characterKitMap/CharacterIdCreateKitBehaviourMap";
import { SkillGlyphsLoaderMap } from "#src/generated/skillGlyphs/SkillGlyphsLoaderMap";
import { GameDataset } from "#src/models/data/GameDataset";
import { kitRecordSchema } from "#src/models/kit/record/KitRecord";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { buildKit } from "#src/services/kit/buildKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKitBehaviour } from "#src/services/kit/travelerKit";

// A character's kit, built once from its record, its talent multipliers and its behaviour module, the three read on
// Demand together with its skill and burst icons, its entry of the hosted `skillGlyphs` index, which the kit carries for
// The HUD's buttons. A character with no module of its own fights with the Traveler's kit, from the Traveler's record,
// Multipliers and behaviour, and carries only icons of its own
export const readCharacterKit = async (gameDataBaseUrl: string, characterId: number): Promise<Kit> => {
  const loadCreateBehaviour = CharacterIdCreateKitBehaviourMap[characterId];
  const kitCharacterId = loadCreateBehaviour ? characterId : TRAVELER_CHARACTER_ID;
  const [createBehaviour, talentMultiplierMap, record, skillGlyphs] = await Promise.all([
    loadCreateBehaviour ? loadCreateBehaviour() : createTravelerKitBehaviour,
    readTalentMultipliers(gameDataBaseUrl, [kitCharacterId]),
    readGameDataEntry(gameDataBaseUrl, GameDataset.Kits, String(kitCharacterId), kitRecordSchema),
    SkillGlyphsLoaderMap[characterId]?.(gameDataBaseUrl),
  ]);
  const kit = buildKit(record, talentMultiplierMap, createBehaviour);
  if (skillGlyphs) kit.skillGlyphs = skillGlyphs;
  return kit;
};
