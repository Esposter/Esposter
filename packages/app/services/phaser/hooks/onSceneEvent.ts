import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { HookArgs } from "vue-phaser";

import { phaserEventEmitter } from "@/services/phaser/events";
import { getScene, useInjectSceneKey } from "vue-phaser";

export const onSceneEvent = (sceneEventKey: SceneEventKey, listener: HookArgs[0]) => {
  const sceneKey = useInjectSceneKey();
  const wrappedListener = () => () => {
    const scene = getScene(sceneKey);
    listener(scene);
  };

  onMounted(() => {
    phaserEventEmitter.on(`${sceneEventKey}${sceneKey}`, wrappedListener());
  });

  onUnmounted(() => {
    phaserEventEmitter.off(`${sceneEventKey}${sceneKey}`, wrappedListener());
  });
};
