import { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import type { EncounterArea } from "@/models/dungeons/area/EncounterArea";
import { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";

export const encounterAreas: EncounterArea[] = [
  {
    id: Area.Grass,
    monsterKeys: [MonsterKey.Aquavalor, MonsterKey.Carnodusk, MonsterKey.Frostsaber, MonsterKey.Ignivolt],
  },
];
