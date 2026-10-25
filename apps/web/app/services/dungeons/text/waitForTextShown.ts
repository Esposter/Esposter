import type { SceneWithPlugins } from "vue-phaserjs";

import { waitForNextTick } from "vue-phaserjs";

// A text change reaches Vue's watchers on the next render, and they hand it to Phaser on the scene's next tick,
// So the text is on screen once both have run
export const waitForTextShown = async (scene: SceneWithPlugins) => {
  await nextTick();
  await waitForNextTick(scene);
};
