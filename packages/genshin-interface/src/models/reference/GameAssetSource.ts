import type { GameSourceKind } from "#src/models/reference/GameSourceKind";

// An asset of the game's own files: the block holding it, under the game's `blocks` folder or a Wwise package, its
// Path ID where it has one, its name, and what the derivation takes from it
export interface GameAssetSource {
  block: string;
  kind: Exclude<GameSourceKind, GameSourceKind.Capture | GameSourceKind.DataTable>;
  name: string;
  pathId?: string;
  role: string;
}
