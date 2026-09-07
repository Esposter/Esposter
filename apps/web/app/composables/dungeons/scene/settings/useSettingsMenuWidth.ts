import { MENU_HORIZONTAL_PADDING } from "@/services/dungeons/scene/settings/constants";
import { onCreate } from "vue-phaserjs";

export const useSettingsMenuWidth = (onComplete?: (width: number) => void) => {
  const width = ref<number>();
  onCreate((scene) => {
    width.value = scene.scale.width - MENU_HORIZONTAL_PADDING * 2;
    onComplete?.(width.value);
  });
  return width;
};
