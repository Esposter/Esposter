import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { onNextTick } from "#src/hooks/onNextTick";
import { Scenes } from "phaser";

// A scene's next-tick listeners are dropped unrun when it shuts down, so the wait also settles on the shutdown, as
// `sleepScene` does, or whatever the caller gates on it would stay pending forever
export const waitForNextTick = (scene: SceneWithPlugins) =>
  new Promise<void>((resolve) => {
    if (scene.sys.settings.status >= Scenes.SHUTDOWN) {
      resolve();
      return;
    }

    const settle = () => {
      scene.events.off(Scenes.Events.SHUTDOWN, settle);
      resolve();
    };
    scene.events.once(Scenes.Events.SHUTDOWN, settle);
    onNextTick(settle, scene.scene.key);
  });
