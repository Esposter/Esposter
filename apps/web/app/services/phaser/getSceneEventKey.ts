import type { SceneEventKey } from "@/models/dungeons/scene/SceneEventKey";
import type { SceneWithPlugins } from "vue-phaserjs";

import { ID_SEPARATOR } from "@esposter/shared";

// The name a scene's event is emitted and listened under: the event and the scene it belongs to, so the same event in
// Another scene is a different one
export const getSceneEventKey = (sceneEventKey: SceneEventKey, sceneKey: SceneWithPlugins["scene"]["key"]) =>
  `${sceneEventKey}${ID_SEPARATOR}${sceneKey}`;
