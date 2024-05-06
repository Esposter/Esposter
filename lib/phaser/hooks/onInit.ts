import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onInit = (listener: (scene: SceneWithPlugins) => void) => {
  pushListener(Lifecycle.Init, listener);
};
