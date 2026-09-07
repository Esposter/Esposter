import type { BaseEncounterableMonster } from "@/models/dungeons/area/BaseEncounterableMonster";
import type { EncounterArea } from "@/models/dungeons/area/EncounterArea";
import type { Except } from "type-fest";

import { Area } from "#shared/generated/tiled/propertyTypes/enum/Area";
import { MonsterKey } from "#shared/models/dungeons/keys/image/UI/MonsterKey";
import { parseDictionaryToArray } from "#shared/util/object/parseDictionaryToArray";

export const EncounterAreaMap = {
  [Area.Grass]: {
    // Common species spawn at their base level; rarer ones spawn levelled up so rarity feels rewarding
    encounterableMonsters: [
      { key: MonsterKey.Aquavalor, level: 5, weight: 45 },
      { key: MonsterKey.Carnodusk, level: 5, weight: 40 },
      { key: MonsterKey.Frostsaber, level: 7, weight: 10 },
      { key: MonsterKey.Ignivolt, level: 6, weight: 25 },
    ],
  },
} as const satisfies Record<Area, Except<EncounterArea<BaseEncounterableMonster>, "id">>;

export const encounterAreas: EncounterArea[] = parseDictionaryToArray(EncounterAreaMap).map(
  ({ encounterableMonsters, ...rest }) => {
    let cumulativeWeight = 0;
    return Object.assign(rest, {
      encounterableMonsters: encounterableMonsters.map((em) => {
        cumulativeWeight += em.weight;
        return Object.assign(em, { cumulativeWeight });
      }),
    });
  },
);
