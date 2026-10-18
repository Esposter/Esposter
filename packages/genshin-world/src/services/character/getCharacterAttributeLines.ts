import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";

import { getArtifactSetAttributeLines } from "#src/services/artifact/getArtifactSetAttributeLines";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { getGrownAttributeLines } from "#src/services/character/getGrownAttributeLines";
import { getWeaponPassiveAttributeLines } from "#src/services/weapon/getWeaponPassiveAttributeLines";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every attribute line a character carries: its own at its level and phase and those every level of it starts with,
// Its weapon's at the weapon's and its passive's stats at the rank it holds, each artifact's main affix at its rarity
// And level and its minor affixes, the bonuses of the sets its artifacts make, and for the Traveler the bonuses of the
// Elements it holds
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
    ...artifacts.flatMap((artifact) => {
      const value = artifactMainAffixCurves.find(
        ({ attribute, rarity }) => attribute === artifact.mainAffix && rarity === artifact.rarity,
      )?.values[artifact.level];
      if (value === undefined)
        throw new InvalidOperationError(Operation.Read, artifact.mainAffix, `no value at level ${artifact.level}`);
      return [{ attribute: artifact.mainAffix, value }, ...artifact.minorAffixes];
    }),
    ...getArtifactSetAttributeLines(artifacts, artifactSetDataMap),
    ...(id === TRAVELER_CHARACTER_ID ? travelerBonusLines : []),
  ];
};
