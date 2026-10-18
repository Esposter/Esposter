import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";

import { getArtifactMainAffixValue } from "#src/services/artifact/getArtifactMainAffixValue";
import { getArtifactSetAttributeLines } from "#src/services/artifact/getArtifactSetAttributeLines";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getGrownAttributeLines } from "#src/services/character/getGrownAttributeLines";
import { getWeaponPassiveAttributeLines } from "#src/services/weapon/getWeaponPassiveAttributeLines";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every attribute line a character carries: its own at its level and phase and those every level of it starts with,
// Its weapon's at the weapon's and its passive's stats at the rank it holds, each artifact's main affix at its rarity and level
// And its minor affixes, the bonuses of the sets its artifacts make, for the Traveler the bonuses of the elements it holds, and
// The party-wide bonuses every character holds
export const getCharacterAttributeLines = (
  { artifacts, ascension, id, level, weapon }: Character,
  {
    artifactMainAffixCurves,
    artifactSetDataMap,
    characterDataMap,
    characterGrowCurveMap,
    weaponDataMap,
    weaponGrowCurveMap,
  }: StatTables,
  travelerBonusLines: AttributeLine[] = [],
  partyBonusLines: AttributeLine[] = [],
): AttributeLine[] => {
  const characterData = characterDataMap.get(id);
  if (!characterData)
    throw new InvalidOperationError(Operation.Read, getCharacterAttributeLines.name, `character ${id}`);
  const weaponData = weaponDataMap.get(weapon.id);
  if (!weaponData)
    throw new InvalidOperationError(Operation.Read, getCharacterAttributeLines.name, `weapon ${weapon.id}`);
  return [
    ...getGrownAttributeLines(characterData, characterGrowCurveMap, level, ascension),
    ...characterData.attributeLines,
    ...getGrownAttributeLines(weaponData, weaponGrowCurveMap, weapon.level, weapon.ascension),
    ...getWeaponPassiveAttributeLines(weapon, weaponData),
    ...artifacts.flatMap((artifact) => [
      { attribute: artifact.mainAffix, value: getArtifactMainAffixValue(artifact, artifactMainAffixCurves) },
      ...artifact.minorAffixes,
    ]),
    ...getArtifactSetAttributeLines(artifacts, artifactSetDataMap),
    ...(id === TRAVELER_CHARACTER_ID ? travelerBonusLines : []),
    ...partyBonusLines,
  ];
};
