import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { onPreload } from "@/lib/phaser/hooks/onPreload";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onShowMessage = (listener: (scene: SceneWithPlugins) => void) => {
  const wrappedListener = (scene: SceneWithPlugins) => () => {
    listener(scene);
  };

  onPreload((scene) => {
    phaserEventEmitter.on(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${scene.scene.key}`, wrappedListener(scene));
  });

  onShutdown((scene) => {
    phaserEventEmitter.off(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${scene.scene.key}`, wrappedListener(scene));
  });
};
