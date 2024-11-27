import type { BaseEncounterableMonster } from "@/models/dungeons/area/BaseEncounterableMonster";
import type { EncounterableMonster } from "@/models/dungeons/area/EncounterableMonster";
import type { Area } from "@/shared/generated/tiled/propertyTypes/enum/Area";

export interface EncounterArea<T extends BaseEncounterableMonster = EncounterableMonster> {
  encounterableMonsters: T[];
  id: Area;
}
