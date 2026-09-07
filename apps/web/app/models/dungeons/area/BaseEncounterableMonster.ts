import type { MonsterKey } from "#shared/models/dungeons/keys/MonsterKey";
import type { Weight } from "@/models/math/Weight";

export interface BaseEncounterableMonster extends Weight {
  key: MonsterKey;
  level: number;
}
