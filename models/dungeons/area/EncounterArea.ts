import type { Area } from "@/generated/tiled/propertyTypes/enum/Area";
import type { MonsterName } from "@/models/dungeons/monster/MonsterName";

export interface EncounterArea {
  id: Area;
  name: string;
  monsterNames: MonsterName[];
}
