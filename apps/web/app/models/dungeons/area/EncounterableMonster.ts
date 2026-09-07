import type { BaseEncounterableMonster } from "@/models/dungeons/area/BaseEncounterableMonster";
import type { CumulativeWeight } from "@/models/math/CumulativeWeight";

export interface EncounterableMonster extends BaseEncounterableMonster, CumulativeWeight {}
