import { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import type { BaseEncounterableMonster } from "@/models/dungeons/area/BaseEncounterableMonster";
import type { EncounterArea } from "@/models/dungeons/area/EncounterArea";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import type { Except } from "type-fest";

export const EncounterAreaMap = {
  [Area.Grass]: {
    encounterableMonsters: [
      { key: MonsterKey.Aquavalor, weight: 3 },
      { key: MonsterKey.Carnodusk, weight: 5 },
      { key: MonsterKey.Frostsaber, weight: 2 },
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
