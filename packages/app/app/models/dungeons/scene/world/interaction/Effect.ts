import type { Position } from "grid-engine";
import type { Types } from "phaser";
import type { SetRequired } from "type-fest";
import type { SceneWithPlugins } from "vue-phaserjs";
// Effect returns whether it was successfully applied or not
// so we can continue checking other interactive objects if not applied
export type Effect = (
  scene: SceneWithPlugins,
  objects: SetRequired<Types.Tilemaps.TiledObject, keyof Position>[],
) => boolean | Promise<boolean>;
