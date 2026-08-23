import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

export const sleep = (scene: SceneWithPlugins, ms: number) =>
  new Promise<void>((resolve) => {
    scene.time.delayedCall(ms, () => {
      resolve();
    });
  });
