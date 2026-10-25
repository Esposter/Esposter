import type { CameraMask } from "@/models/dungeons/camera/CameraMask";
import type { SceneWithPlugins } from "vue-phaserjs";

export const removeCameraMask = (scene: SceneWithPlugins, { graphics, mask }: CameraMask) => {
  scene.cameras.main.filters.internal.remove(mask);
  graphics.destroy();
};
