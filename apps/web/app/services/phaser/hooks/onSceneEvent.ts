import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { HookArgs } from "vue-phaserjs";

import { phaserEventEmitter } from "@/services/phaser/events";
import { getScene, useInjectSceneKey } from "vue-phaserjs";

export const onSceneEvent = (sceneEventKey: SceneEventKey, listener: HookArgs[0]) => {
  const sceneKey = useInjectSceneKey();
  // One reference for both halves — `off` matches on identity, so a wrapper built per call would leave the
  // Listener attached for the lifetime of the emitter
  const onEvent = () => {
    listener(getScene(sceneKey));
  };

  onMounted(() => {
    phaserEventEmitter.on(`${sceneEventKey}${sceneKey}`, onEvent);
  });

  onUnmounted(() => {
    phaserEventEmitter.off(`${sceneEventKey}${sceneKey}`, onEvent);
  });
};
