import type { RawStatTables } from "#src/models/character/RawStatTables";
import type { StatTables } from "#src/models/character/StatTables";

import { artifactMainAffixCurveSchema } from "#src/models/artifact/ArtifactMainAffixCurve";
import { artifactRarityDataSchema } from "#src/models/artifact/ArtifactRarityData";
import { artifactSetDataSchema } from "#src/models/artifact/ArtifactSetData";
import { characterDataSchema } from "#src/models/character/CharacterData";
import { masterlessLevelLiftSchema } from "#src/models/character/MasterlessLevelLift";
import { expMaterialSchema } from "#src/models/inventory/ExpMaterial";
import { weaponDataSchema } from "#src/models/weapon/WeaponData";
import { z } from "zod";

const growCurveRecordSchema = z.record(z.string(), z.array(z.number()));

export const parseStatTables = ({
  artifactExpMaterials,
  artifactMainAffixCurves,
  artifactRarities,
  artifactSets,
  characterExpMaterials,
  characterExpToNext,
  characterGrowCurves,
  characters,
  masterlessLevelLifts,
  weaponEnhancementOres,
  weaponGrowCurves,
  weapons,
}: RawStatTables): StatTables => ({
  artifactExpMaterialMap: new Map(
    z
      .array(expMaterialSchema)
      .parse(artifactExpMaterials)
      .map((artifactExpMaterial) => [artifactExpMaterial.id, artifactExpMaterial]),
  ),
  artifactMainAffixCurves: z.array(artifactMainAffixCurveSchema).parse(artifactMainAffixCurves),
  artifactRarityDataMap: new Map(
    z
      .array(artifactRarityDataSchema)
      .parse(artifactRarities)
      .map((artifactRarityData) => [artifactRarityData.rarity, artifactRarityData]),
  ),
  artifactSetDataMap: new Map(
    z
      .array(artifactSetDataSchema)
      .parse(artifactSets)
      .map((artifactSetData) => [artifactSetData.id, artifactSetData]),
  ),
  characterDataMap: new Map(
    z
      .array(characterDataSchema)
      .parse(characters)
      .map((characterData) => [characterData.id, characterData]),
  ),
  characterExpMaterials: z.array(expMaterialSchema).parse(characterExpMaterials),
  characterExpToNext: z.array(z.number()).parse(characterExpToNext),
  characterGrowCurveMap: new Map(Object.entries(growCurveRecordSchema.parse(characterGrowCurves))),
  masterlessLevelLiftMap: new Map(
    z
      .array(masterlessLevelLiftSchema)
      .parse(masterlessLevelLifts)
      .map((masterlessLevelLift) => [masterlessLevelLift.fromLevel, masterlessLevelLift]),
  ),
  weaponDataMap: new Map(
    z
      .array(weaponDataSchema)
      .parse(weapons)
      .map((weaponData) => [weaponData.id, weaponData]),
  ),
  weaponEnhancementOres: z.array(expMaterialSchema).parse(weaponEnhancementOres),
  weaponGrowCurveMap: new Map(Object.entries(growCurveRecordSchema.parse(weaponGrowCurves))),
});
