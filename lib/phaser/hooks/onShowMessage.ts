import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { onPreload } from "@/lib/phaser/hooks/onPreload";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import type { HookArgs } from "@/lib/phaser/models/lifecycle/HookArgs";
import { SHOW_MESSAGE_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onShowMessage = (...args: HookArgs) => {
  const [listener, sceneKey] = args;
  const wrappedListener = (scene: SceneWithPlugins) => () => {
    listener(scene);
  };

  onPreload((scene) => {
    phaserEventEmitter.on(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey ?? scene.scene.key}`, wrappedListener(scene));
  }, sceneKey);

  onShutdown((scene) => {
    phaserEventEmitter.off(`${SHOW_MESSAGE_SCENE_EVENT_KEY}${sceneKey ?? scene.scene.key}`, wrappedListener(scene));
  }, sceneKey);
};
