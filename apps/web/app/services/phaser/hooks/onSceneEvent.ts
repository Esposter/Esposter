import type { SceneEventKey } from "#src/models/dungeons/scene/SceneEventKey";
import type { HookArgs } from "vue-phaserjs";

import { getSceneEventKey } from "#src/services/phaser/getSceneEventKey";
import { getScene, useInjectSceneKey } from "vue-phaserjs";

export const onSceneEvent = (sceneEventKey: SceneEventKey, listener: HookArgs[0]) => {
  const sceneKey = useInjectSceneKey();
  usePhaserListener(getSceneEventKey(sceneEventKey, sceneKey), () => {
    listener(getScene(sceneKey));
  });
};
