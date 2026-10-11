import type { Kit } from "#src/models/kit/Kit";

import { CharacterIdCreateKitBehaviourMap } from "#src/generated/characterKitMaps/CharacterIdCreateKitBehaviourMap";
import { CharacterIdSkillGlyphsLoaderMap } from "#src/generated/characterKitMaps/CharacterIdSkillGlyphsLoaderMap";
import { GameDataset } from "#src/models/data/GameDataset";
import { kitRecordSchema } from "#src/models/kit/record/KitRecord";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { buildKit } from "#src/services/kit/buildKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKitBehaviour } from "#src/services/kit/travelerKit";

// A character's kit, built once from its record, its talent multipliers and its behaviour module, the three read on
// Demand together with its traced skill glyphs, which the kit carries for the HUD's buttons. A character with no module
// Of its own fights with the Traveler's kit, from the Traveler's record, multipliers and behaviour, and carries only
// Glyphs of its own
export const readCharacterKit = async (gameDataBaseUrl: string, characterId: number): Promise<Kit> => {
  const loadCreateBehaviour = CharacterIdCreateKitBehaviourMap[characterId];
  const kitCharacterId = loadCreateBehaviour ? characterId : TRAVELER_CHARACTER_ID;
  const [createBehaviour, talentMultiplierMap, record, skillGlyphs] = await Promise.all([
    loadCreateBehaviour ? loadCreateBehaviour() : createTravelerKitBehaviour,
    readTalentMultipliers(gameDataBaseUrl, [kitCharacterId]),
    readGameDataEntry(gameDataBaseUrl, GameDataset.Kits, String(kitCharacterId), kitRecordSchema),
    CharacterIdSkillGlyphsLoaderMap[characterId]?.(),
  ]);
  const kit = buildKit(record, talentMultiplierMap, createBehaviour);
  if (skillGlyphs) kit.skillGlyphs = skillGlyphs;
  return kit;
};
