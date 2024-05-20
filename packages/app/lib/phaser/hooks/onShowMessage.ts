import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import type { HookArgs } from "@/lib/phaser/models/lifecycle/HookArgs";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { getScene } from "@/lib/phaser/util/getScene";

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
