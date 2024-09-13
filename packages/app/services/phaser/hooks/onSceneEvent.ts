import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { HookArgs } from "vue-phaserjs";

import { phaserEventEmitter } from "@/services/phaser/events";
import { getScene, useInjectSceneKey } from "vue-phaserjs";

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
