import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";

export interface EncounterArea {
  id: Area;
  name: string;
  monsterKeys: MonsterKey[];
}
