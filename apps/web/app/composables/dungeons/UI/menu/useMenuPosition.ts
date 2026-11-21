import type { Position } from "grid-engine-headless";

import { getMenuPosition } from "#src/services/dungeons/UI/menu/getMenuPosition";
import { onCreate } from "vue-phaserjs";

// A menu that sits in the scene's corner is shown once the scene has its size, so it stays unset until then
export const useMenuPosition = () => {
  const position = ref<Position>();

  onCreate((scene) => {
    position.value = getMenuPosition(scene);
  });

  return position;
};
