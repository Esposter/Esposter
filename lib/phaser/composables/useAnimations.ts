import type { AnimationConfiguration } from "@/lib/phaser/models/configuration/shared/AnimationConfiguration";
import { usePhaserStore } from "@/lib/phaser/store/phaser";

export const useAnimations = (configurations: AnimationConfiguration["animations"]) => {
  const phaserStore = usePhaserStore();
  const { scene } = storeToRefs(phaserStore);
  const animations = ref(configurations);

  onUnmounted(() => {
    for (const { key } of configurations) {
      if (!key) continue;
      scene.value.anims.remove(key);
    }
  });

  return animations;
};
