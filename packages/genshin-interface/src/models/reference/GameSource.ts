import type { GameAssetSource } from "#src/models/reference/GameAssetSource";
import type { GameCaptureSource } from "#src/models/reference/GameCaptureSource";
import type { GameTableSource } from "#src/models/reference/GameTableSource";

// One piece of the game's data a derivation is taken from, named well enough to open it again: an asset in a block, a
// Recording or a still, or a table of the community's dump. Metadata only: never a value, a vertex or a pixel of it
export type GameSource = GameAssetSource | GameCaptureSource | GameTableSource;
