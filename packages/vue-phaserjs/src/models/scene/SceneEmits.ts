import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

export interface SceneEmits {
  create: [SceneWithPlugins];
  init: [SceneWithPlugins];
  preload: [SceneWithPlugins];
  shutdown: [SceneWithPlugins];
  update: [SceneWithPlugins, ...Parameters<SceneWithPlugins["update"]>];
}
