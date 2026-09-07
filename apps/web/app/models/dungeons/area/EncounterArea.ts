import type { Area } from "#shared/generated/tiled/propertyTypes/enum/Area";
import type { BaseEncounterableMonster } from "@/models/dungeons/area/BaseEncounterableMonster";
import type { EncounterableMonster } from "@/models/dungeons/area/EncounterableMonster";

export interface EncounterArea<T extends BaseEncounterableMonster = EncounterableMonster> {
  encounterableMonsters: T[];
  id: Area;
}
