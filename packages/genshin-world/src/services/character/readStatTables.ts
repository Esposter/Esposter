import type { StatTables } from "#src/models/character/StatTables";

import { artifactMainAffixCurveSchema } from "#src/models/artifact/ArtifactMainAffixCurve";
import { artifactSetDataSchema } from "#src/models/artifact/ArtifactSetData";
import { characterDataSchema } from "#src/models/character/CharacterData";
import { weaponDataSchema } from "#src/models/weapon/WeaponData";
import { z } from "zod";

// The game's stat tables, as `pnpm -C scripts genshin:assets stats` writes them from its own, each checked against its
// Schema as it arrives. Each is imported on demand, so the build splits it into a chunk of its own rather than the
// Package's, which every page of the opening downloads
export const readStatTables = async (): Promise<StatTables> => {
  const [artifactMainAffixCurves, artifactSets, characterGrowCurves, characters, weaponGrowCurves, weapons] =
    await Promise.all([
      import("#src/generated/stats/artifactMainAffixCurves.json"),
      import("#src/generated/stats/artifactSets.json"),
      import("#src/generated/stats/characterGrowCurves.json"),
      import("#src/generated/stats/characters.json"),
      import("#src/generated/stats/weaponGrowCurves.json"),
      import("#src/generated/stats/weapons.json"),
    ]);
  const growCurveRecordSchema = z.record(z.string(), z.array(z.number()));
  return {
    artifactMainAffixCurves: z.array(artifactMainAffixCurveSchema).parse(artifactMainAffixCurves.default),
    artifactSetDataMap: new Map(
      z
        .array(artifactSetDataSchema)
        .parse(artifactSets.default)
        .map((artifactSetData) => [artifactSetData.id, artifactSetData]),
    ),
    characterDataMap: new Map(
      z
        .array(characterDataSchema)
        .parse(characters.default)
        .map((characterData) => [characterData.id, characterData]),
    ),
    characterGrowCurveMap: new Map(Object.entries(growCurveRecordSchema.parse(characterGrowCurves.default))),
    weaponDataMap: new Map(
      z
        .array(weaponDataSchema)
        .parse(weapons.default)
        .map((weaponData) => [weaponData.id, weaponData]),
    ),
    weaponGrowCurveMap: new Map(Object.entries(growCurveRecordSchema.parse(weaponGrowCurves.default))),
  };
};
