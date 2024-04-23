import { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import type { EncounterArea } from "@/models/dungeons/area/EncounterArea";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import { parseDictionaryToArray } from "@/util/parseDictionaryToArray";
import type { Except } from "type-fest";

export const EncounterAreaMap = {
  [Area.Grass]: {
    monsterKeys: [MonsterKey.Aquavalor, MonsterKey.Carnodusk, MonsterKey.Frostsaber, MonsterKey.Ignivolt],
  },
} as const satisfies Record<Area, Except<EncounterArea, "id">>;

export const encounterAreas: EncounterArea[] = parseDictionaryToArray(EncounterAreaMap);
