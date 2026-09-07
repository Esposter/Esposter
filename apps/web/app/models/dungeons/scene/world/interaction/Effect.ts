import type { Position } from "grid-engine";
import type { Types } from "phaser";
import type { SetRequired } from "type-fest";
import type { SceneWithPlugins } from "vue-phaserjs";
// The boolean is what lets a caller carry on to the next interactive object when this one did not apply
export type Effect = (
  scene: SceneWithPlugins,
  objects: SetRequired<Types.Tilemaps.TiledObject, keyof Position>[],
) => boolean | Promise<boolean>;
