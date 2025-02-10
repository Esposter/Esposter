import type { BaseEncounterableMonster } from "@/models/dungeons/area/BaseEncounterableMonster";
import type { EncounterArea } from "@/models/dungeons/area/EncounterArea";
import type { Except } from "type-fest";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { Area } from "#shared/generated/tiled/propertyTypes/enum/Area";
import { parseDictionaryToArray } from "#shared/util/parseDictionaryToArray";

export const EncounterAreaMap = {
  [Area.Grass]: {
    encounterableMonsters: [
      { key: FileKey.UIMonstersAquavalor, weight: 45 },
      { key: FileKey.UIMonstersCarnodusk, weight: 40 },
      { key: FileKey.UIMonstersFrostsaber, weight: 10 },
      { key: FileKey.UIMonstersIgnivolt, weight: 25 },
    ],
  },
} as const satisfies Record<Area, Except<EncounterArea<BaseEncounterableMonster>, "id">>;

export const encounterAreas: EncounterArea[] = parseDictionaryToArray(EncounterAreaMap).map(
  ({ encounterableMonsters, ...rest }) => {
    let cumulativeWeight = 0;
    return {
      ...rest,
      encounterableMonsters: encounterableMonsters.map((em) => {
        cumulativeWeight += em.weight;
        return { ...em, cumulativeWeight };
      }),
    };
  },
);
