import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";

export const onShowMessage = (listener: (scene: ReturnType<typeof useInjectScene>) => void) => {
  const scene = useInjectScene();
  const wrappedListener = () => {
    listener(scene);
  };

  phaserEventEmitter.on(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${scene.scene.key as SceneKey}`, wrappedListener);

  onShutdown(() => {
    phaserEventEmitter.off(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${scene.scene.key as SceneKey}`, wrappedListener);
  }, scene.scene.key);
};
