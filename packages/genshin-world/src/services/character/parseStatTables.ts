import type { RawStatTables } from "#src/models/character/RawStatTables";
import type { StatTables } from "#src/models/character/StatTables";

import { artifactMainAffixCurveSchema } from "#src/models/artifact/ArtifactMainAffixCurve";
import { artifactSetDataSchema } from "#src/models/artifact/ArtifactSetData";
import { characterDataSchema } from "#src/models/character/CharacterData";
import { weaponDataSchema } from "#src/models/weapon/WeaponData";
import { z } from "zod";

const growCurveRecordSchema = z.record(z.string(), z.array(z.number()));

export const parseStatTables = ({
  artifactMainAffixCurves,
  artifactSets,
  characterGrowCurves,
  characters,
  weaponGrowCurves,
  weapons,
}: RawStatTables): StatTables => ({
  artifactMainAffixCurves: z.array(artifactMainAffixCurveSchema).parse(artifactMainAffixCurves),
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
  characterGrowCurveMap: new Map(Object.entries(growCurveRecordSchema.parse(characterGrowCurves))),
  weaponDataMap: new Map(
    z
      .array(weaponDataSchema)
      .parse(weapons)
      .map((weaponData) => [weaponData.id, weaponData]),
  ),
  weaponGrowCurveMap: new Map(Object.entries(growCurveRecordSchema.parse(weaponGrowCurves))),
});
