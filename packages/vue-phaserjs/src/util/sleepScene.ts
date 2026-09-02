import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { Scenes } from "phaser";

// Waits on the scene's own clock rather than the wall clock, so a paused or time-scaled scene pauses and scales
// The wait with it. Named apart from `@esposter/shared`'s `sleep` for exactly that reason: the two are
// Interchangeable to a reader and to an editor's auto-import, and swapping one for the other leaves an
// Animation running through a pause with nothing to see in the diff.
// Shutdown is the second settlement path because the clock destroys its pending timers without firing them, so a
// Scene stopped mid-wait would leave the promise pending forever and strand whatever the caller gates on it - a
// Battle turn that never ends, an input flag that never clears. The timer needs no matching removal: the clock
// Discarding it is the very reason this listener exists
export const sleepScene = (scene: SceneWithPlugins, durationMs: number) =>
  new Promise<void>((resolve) => {
    const settle = () => {
      scene.events.off(Scenes.Events.SHUTDOWN, settle);
      resolve();
    };
    scene.time.delayedCall(durationMs, settle);
    scene.events.once(Scenes.Events.SHUTDOWN, settle);
  });
