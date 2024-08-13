import type { HookArgs } from "@/lib/phaser/models/lifecycle/HookArgs";
import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";

import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { getScene } from "@/lib/phaser/util/getScene";
import { phaserEventEmitter } from "@/services/phaser/events";

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
