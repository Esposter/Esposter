import type { TalentLevels } from "#src/models/character/TalentLevels";
import type { Kit } from "#src/models/kit/Kit";

import { CharacterIdCreateKitBehaviourMap } from "#src/generated/characterKitMap/CharacterIdCreateKitBehaviourMap";
import { SkillGlyphsLoaderMap } from "#src/generated/skillGlyphs/SkillGlyphsLoaderMap";
import { GameDataset } from "#src/models/data/GameDataset";
import { kitRecordSchema } from "#src/models/kit/record/KitRecord";
import { COMBAT_TALENT_ORDER, TALENT_START_LEVELS, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readCharacterTalentKits } from "#src/services/character/readCharacterTalentKits";
import { readGameDataEntry } from "#src/services/data/readGameDataEntry";
import { buildKit } from "#src/services/kit/buildKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKitBehaviour } from "#src/services/kit/travelerKit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A character's kit, built once from its record, its talent multipliers and its behaviour module, the three read on
// Demand together with its skill and burst icons, its entry of the hosted `skillGlyphs` index, which the kit carries for
// The HUD's buttons. A character with no module of its own fights with the Traveler's kit, from the Traveler's record,
// Multipliers and behaviour, and carries only icons of its own. Each talent plays at the level given for it, its
// Parameters read off its table at that level, and a character given no levels plays at the levels it is created at
export const readCharacterKit = async (
  gameDataBaseUrl: string,
  characterId: number,
  talentLevels: TalentLevels = TALENT_START_LEVELS,
): Promise<Kit> => {
  const loadCreateBehaviour = CharacterIdCreateKitBehaviourMap[characterId];
  const kitCharacterId = loadCreateBehaviour ? characterId : TRAVELER_CHARACTER_ID;
  const [createBehaviour, talentMultiplierMap, record, skillGlyphs, characterTalentKits] = await Promise.all([
    loadCreateBehaviour ? loadCreateBehaviour() : createTravelerKitBehaviour,
    readTalentMultipliers(gameDataBaseUrl, [kitCharacterId]),
    readGameDataEntry(gameDataBaseUrl, GameDataset.Kits, String(kitCharacterId), kitRecordSchema),
    SkillGlyphsLoaderMap[characterId]?.(gameDataBaseUrl),
    readCharacterTalentKits(gameDataBaseUrl),
  ]);
  // The record's parameters name the proud skill group of each talent, so each group is given the level its talent plays at
  const talentGroupIds = characterTalentKits.find(
    ({ characterId: talentKitCharacterId }) => talentKitCharacterId === kitCharacterId,
  )?.talentGroupIds;
  if (!talentGroupIds) throw new InvalidOperationError(Operation.Read, `${kitCharacterId}`, "no talent groups");
  const talentLevelMap = Object.fromEntries(
    COMBAT_TALENT_ORDER.map((talent) => [talentGroupIds[talent], talentLevels[talent]]),
  );
  const kit = buildKit(record, talentMultiplierMap, talentLevelMap, createBehaviour);
  if (skillGlyphs) kit.skillGlyphs = skillGlyphs;
  return kit;
};
