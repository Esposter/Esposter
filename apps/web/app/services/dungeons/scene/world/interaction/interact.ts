import type { SceneWithPlugins } from "vue-phaserjs";

import { interactWithNpc } from "#src/services/dungeons/scene/world/interaction/interactWithNpc";
import { interactWithObject } from "#src/services/dungeons/scene/world/interaction/interactWithObject";

export const interact = async (scene: SceneWithPlugins) =>
  (await interactWithNpc(scene)) || (await interactWithObject(scene));
