import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import type { HookArgs } from "@/lib/phaser/models/lifecycle/HookArgs";
import { getScene } from "@/lib/phaser/util/getScene";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/services/phaser/constants";
import { phaserEventEmitter } from "@/services/phaser/events";

export const onShowMessage = (listener: HookArgs[0]) => {
  const sceneKey = useInjectSceneKey();
  const wrappedListener = () => () => {
    const scene = getScene(sceneKey);
    listener(scene);
  };

  onMounted(() => {
    phaserEventEmitter.on(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey}`, wrappedListener());
  });

  onUnmounted(() => {
    phaserEventEmitter.off(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey}`, wrappedListener());
  });
};
