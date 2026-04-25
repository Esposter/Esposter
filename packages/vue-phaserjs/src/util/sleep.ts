import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

export const sleep = (scene: SceneWithPlugins, ms: number) =>
  new Promise<void>((resolve) => {
    scene.time.delayedCall(ms, () => {
      resolve();
    });
  });
