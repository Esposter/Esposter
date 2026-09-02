import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

// Waits on the scene's own clock rather than the wall clock, so a paused or time-scaled scene pauses and scales
// The wait with it. Named apart from `@esposter/shared`'s `sleep` for exactly that reason: the two are
// Interchangeable to a reader and to an editor's auto-import, and swapping one for the other leaves an
// Animation running through a pause with nothing to see in the diff
export const sleepScene = (scene: SceneWithPlugins, durationMs: number) =>
  new Promise<void>((resolve) => {
    scene.time.delayedCall(durationMs, () => {
      resolve();
    });
  });
