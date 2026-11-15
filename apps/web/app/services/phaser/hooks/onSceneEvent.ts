import type { SceneEventKey } from "#src/models/dungeons/scene/SceneEventKey";
import type { HookArgs } from "vue-phaserjs";

import { getSceneEventKey } from "#src/services/phaser/getSceneEventKey";
import { phaserEventEmitter } from "#src/services/phaser/phaserEventEmitter";
import { getScene, useInjectSceneKey } from "vue-phaserjs";

export const onSceneEvent = (sceneEventKey: SceneEventKey, listener: HookArgs[0]) => {
  const sceneKey = useInjectSceneKey();
  // One key and one reference for both halves — `off` matches on identity, so a wrapper built per call would leave the
  // Listener attached for the lifetime of the emitter
  const eventKey = getSceneEventKey(sceneEventKey, sceneKey);
  const onEvent = () => {
    listener(getScene(sceneKey));
  };

  onMounted(() => {
    phaserEventEmitter.on(eventKey, onEvent);
  });

  onUnmounted(() => {
    phaserEventEmitter.off(eventKey, onEvent);
  });
};
