import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { Scenes } from "phaser";

// Hands `schedule` the settle that ends a wait, and settles the wait itself when the scene shuts down. A shutdown
// Destroys the scene's clock and drops its next-tick listeners without firing them, so a wait on either would stay
// Pending forever and strand whatever the caller gates on it
export const settleOnShutdown = (scene: SceneWithPlugins, schedule: (settle: () => void) => void) =>
  new Promise<void>((resolve) => {
    // A scene that has shut down has no clock or tick left to wait on, so there is nothing to wait through
    if (scene.sys.settings.status >= Scenes.SHUTDOWN) {
      resolve();
      return;
    }

    const settle = () => {
      scene.events.off(Scenes.Events.SHUTDOWN, settle);
      resolve();
    };
    schedule(settle);
    scene.events.once(Scenes.Events.SHUTDOWN, settle);
  });
