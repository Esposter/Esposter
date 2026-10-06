import type { GameSourceKind } from "#src/models/reference/GameSourceKind";

// A table of the community's dump of the game's data, or an index it publishes: its path in the dump, the row or the
// Entry read by its name, and what the derivation takes from it
export interface GameTableSource {
  kind: GameSourceKind.DataTable;
  name: string;
  role: string;
  table: string;
}
