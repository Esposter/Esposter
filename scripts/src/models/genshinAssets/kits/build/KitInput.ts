import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

// What the builder reads for one character before it builds or compares: its id, English name and overlay's name, its
// Tables, the record its kit module holds today, its gcsim folder at the tag if the tag has one, every source's
// Candidates for its record, and what a reader could not read for it
export interface KitInput {
  characterId: number;
  gcsimFolder?: string;
  moduleRecord: KitRecord;
  name: string;
  notes: string[];
  overlayName: string;
  sourceCandidateMap: Map<string, KitCandidate[]>;
  tables: KitTables;
}
