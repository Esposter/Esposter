import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitOverlay } from "#src/models/genshinAssets/kits/KitOverlay";
import type { NamedHitCandidateMap } from "#src/models/genshinAssets/kits/NamedHitCandidateMap";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { KitRecord } from "genshin-world";

// What the builder reads for one character before it builds or compares: its id, English name and overlay's name, its
// Tables, the record published for it unless its kit is yet to be published, its gcsim folder at the tag if the tag has one, every source's candidates for
// Its record, and what a reader could not read for it
export interface KitInput {
  characterId: number;
  gcsimFolder?: string;
  name: string;
  namedHitCandidateMap: NamedHitCandidateMap;
  notes: string[];
  overlay: KitOverlay;
  overlayName: string;
  publishedRecord?: KitRecord;
  sourceCandidateMap: Map<string, KitCandidate[]>;
  tables: KitTables;
}
