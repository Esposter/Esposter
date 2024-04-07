import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useInputStore } from "@/lib/phaser/store/phaser/input";

export const useCameraStore = defineStore("phaser/camera", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const inputStore = useInputStore();
  const { isActive } = storeToRefs(inputStore);
  const isFading = ref(false);
  const fadeIn = (...args: Parameters<typeof scene.value.cameras.main.fadeIn>) => {
    isFading.value = true;
    isActive.value = false;
    scene.value.cameras.main.fadeIn(...args);
  };
  const fadeOut = (...args: Parameters<typeof scene.value.cameras.main.fadeOut>) => {
    isFading.value = true;
    isActive.value = false;
    scene.value.cameras.main.fadeOut(...args);
  };
  return {
    isFading,
    fadeIn,
    fadeOut,
  };
});
