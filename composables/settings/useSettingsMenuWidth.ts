import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { MENU_HORIZONTAL_PADDING } from "@/services/dungeons/settings/constants";

export const useSettingsMenuWidth = () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  return computed(() => scene.value.scale.width - MENU_HORIZONTAL_PADDING * 2);
};
