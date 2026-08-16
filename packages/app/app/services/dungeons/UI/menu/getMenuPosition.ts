import type { Position } from "grid-engine";
import type { SceneWithPlugins } from "vue-phaserjs";

import { MENU_PADDING, MENU_WIDTH } from "@/services/dungeons/UI/menu/constants";

// Every menu sits one padding in from the scene's top-right corner
export const getMenuPosition = (scene: SceneWithPlugins): Position => ({
  x: scene.scale.width - MENU_PADDING * 2 - MENU_WIDTH,
  y: MENU_PADDING * 2,
});
