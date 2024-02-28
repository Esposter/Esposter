import { usePhaserStore } from "@/lib/phaser/store/phaser";

export const useCameraStore = defineStore("phaser/camera", () => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const isFading = ref(false);
  const fadeIn = (...args: Parameters<typeof scene.value.cameras.main.fadeIn>) => {
    isFading.value = true;
    scene.value.cameras.main.fadeIn(...args);
  };
  const fadeOut = (...args: Parameters<typeof scene.value.cameras.main.fadeOut>) => {
    isFading.value = true;
    scene.value.cameras.main.fadeOut(...args);
  };
  return {
    isFading,
    fadeIn,
    fadeOut,
  };
});
