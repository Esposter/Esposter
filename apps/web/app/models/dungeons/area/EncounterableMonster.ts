import type { BaseEncounterableMonster } from "#src/models/dungeons/area/BaseEncounterableMonster";
import type { CumulativeWeight } from "#src/models/math/CumulativeWeight";

export interface EncounterableMonster extends BaseEncounterableMonster, CumulativeWeight {}
