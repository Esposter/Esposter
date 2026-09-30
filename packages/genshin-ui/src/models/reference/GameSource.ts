import type { GameSourceKind } from "#src/models/reference/GameSourceKind";

// One piece of the game's data a derivation is taken from, named well enough to open it again: its kind, the block
// Holding it (under the game's `blocks` folder) or, for a capture, the reference it is, its path ID where it has one,
// Its name, and what the derivation takes from it. Metadata only: never a value, a vertex or a pixel of it
export interface GameSource {
  block: string;
  kind: GameSourceKind;
  name: string;
  pathId?: string;
  role: string;
}
