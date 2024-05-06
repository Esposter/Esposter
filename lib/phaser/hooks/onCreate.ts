import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onCreate = (listener: (scene: SceneWithPlugins) => void) => {
  pushListener(Lifecycle.Create, listener);
};
