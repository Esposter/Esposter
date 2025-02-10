import type { FileKey } from "#shared/generated/phaser/FileKey";
import type { Weight } from "@/models/math/Weight";

export interface BaseEncounterableMonster extends Weight {
  key: FileKey;
}
