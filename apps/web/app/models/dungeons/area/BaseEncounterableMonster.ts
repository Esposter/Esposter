import type { MonsterFileKey } from "#shared/models/dungeons/keys/MonsterFileKey";
import type { Weight } from "@/models/math/Weight";

export interface BaseEncounterableMonster extends Weight {
  key: MonsterFileKey;
  level: number;
}
