import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { Character } from "#src/models/character/Character";

import { ArtifactMainAffixCurves } from "#src/services/artifact/ArtifactMainAffixCurves";
import { ArtifactSetDataMap } from "#src/services/artifact/ArtifactSetDataMap";
import { getArtifactSetAttributeLines } from "#src/services/artifact/getArtifactSetAttributeLines";
import { CharacterDataMap } from "#src/services/character/CharacterDataMap";
import { CharacterGrowCurveMap } from "#src/services/character/CharacterGrowCurveMap";
import { getGrownAttributeLines } from "#src/services/character/getGrownAttributeLines";
import { WeaponDataMap } from "#src/services/weapon/WeaponDataMap";
import { WeaponGrowCurveMap } from "#src/services/weapon/WeaponGrowCurveMap";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Every attribute line a character carries: its own at its level and phase and those every level of it starts with,
// Its weapon's at the weapon's, each artifact's main affix at its rarity and level and its minor affixes, and the
// Bonuses of the sets its artifacts make
export const getCharacterAttributeLines = ({ artifacts, ascension, id, level, weapon }: Character): AttributeLine[] => {
  const characterData = CharacterDataMap.get(id);
  if (!characterData)
    throw new InvalidOperationError(Operation.Read, getCharacterAttributeLines.name, `character ${id}`);
  const weaponData = WeaponDataMap.get(weapon.id);
  if (!weaponData)
    throw new InvalidOperationError(Operation.Read, getCharacterAttributeLines.name, `weapon ${weapon.id}`);
  return [
    ...getGrownAttributeLines(characterData, CharacterGrowCurveMap, level, ascension),
    ...characterData.attributeLines,
    ...getGrownAttributeLines(weaponData, WeaponGrowCurveMap, weapon.level, weapon.ascension),
    ...artifacts.flatMap((artifact) => {
      const value = ArtifactMainAffixCurves.find(
        ({ attribute, rarity }) => attribute === artifact.mainAffix && rarity === artifact.rarity,
      )?.values[artifact.level];
      if (value === undefined)
        throw new InvalidOperationError(Operation.Read, artifact.mainAffix, `no value at level ${artifact.level}`);
      return [{ attribute: artifact.mainAffix, value }, ...artifact.minorAffixes];
    }),
    ...getArtifactSetAttributeLines(artifacts, ArtifactSetDataMap),
  ];
};
