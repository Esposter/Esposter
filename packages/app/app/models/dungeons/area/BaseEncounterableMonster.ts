import type { MonsterKey } from "@/models/dungeons/keys/image/UI/MonsterKey";
import type { Weight } from "@/models/math/Weight";

export interface BaseEncounterableMonster extends Weight {
  key: MonsterKey;
}
