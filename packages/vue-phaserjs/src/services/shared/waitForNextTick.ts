import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { onNextTick } from "#src/hooks/onNextTick";
import { settleOnShutdown } from "#src/services/shared/settleOnShutdown";

// A scene's next-tick listeners are dropped unrun when it shuts down, so the wait also settles on the shutdown, as
// `sleepScene` does, or whatever the caller gates on it would stay pending forever
export const waitForNextTick = (scene: SceneWithPlugins) =>
  settleOnShutdown(scene, (settle) => {
    onNextTick(settle, scene.scene.key);
  });
