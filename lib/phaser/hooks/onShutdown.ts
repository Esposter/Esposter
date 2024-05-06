import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onShutdown = (listener: (scene: SceneWithPlugins) => void, sceneKey?: string) => {
  pushListener(Lifecycle.Shutdown, listener, sceneKey);
};
