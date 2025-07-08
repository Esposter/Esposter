import type { BaseEncounterableMonster } from "@/models/dungeons/area/BaseEncounterableMonster";
import type { EncounterArea } from "@/models/dungeons/area/EncounterArea";
import type { Except } from "type-fest";

import { Area } from "#shared/generated/tiled/propertyTypes/enum/Area";
import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";

export const EncounterAreaMap = {
  [Area.Grass]: {
    encounterableMonsters: [
      { key: MonsterKey.Aquavalor, weight: 45 },
      { key: MonsterKey.Carnodusk, weight: 40 },
      { key: MonsterKey.Frostsaber, weight: 10 },
      { key: MonsterKey.Ignivolt, weight: 25 },
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
