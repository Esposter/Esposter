import { useInjectGame } from "@/lib/phaser/composables/useInjectGame";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { onPreload } from "@/lib/phaser/hooks/onPreload";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { getScene } from "@/lib/phaser/util/getScene";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onShowMessage = (listener: (scene: SceneWithPlugins) => void) => {
  const game = useInjectGame();
  const sceneKey = useInjectSceneKey();
  const wrappedListener = () => {
    listener(getScene(game, sceneKey));
  };

  onPreload(() => {
    phaserEventEmitter.on(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey}`, wrappedListener);
  });

  onShutdown(() => {
    phaserEventEmitter.off(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey}`, wrappedListener);
  });
};
