import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";
import type { StatTables } from "#src/models/character/StatTables";

import { getArtifactSetAttributeLines } from "#src/services/artifact/getArtifactSetAttributeLines";
import { getGrownAttributeLines } from "#src/services/character/getGrownAttributeLines";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every attribute line a character carries: its own at its level and phase and those every level of it starts with,
// Its weapon's at the weapon's, each artifact's main affix at its rarity and level and its minor affixes, and the
// Bonuses of the sets its artifacts make
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
    ...artifacts.flatMap((artifact) => {
      const value = artifactMainAffixCurves.find(
        ({ attribute, rarity }) => attribute === artifact.mainAffix && rarity === artifact.rarity,
      )?.values[artifact.level];
      if (value === undefined)
        throw new InvalidOperationError(Operation.Read, artifact.mainAffix, `no value at level ${artifact.level}`);
      return [{ attribute: artifact.mainAffix, value }, ...artifact.minorAffixes];
    }),
    ...getArtifactSetAttributeLines(artifacts, artifactSetDataMap),
  ];
};
