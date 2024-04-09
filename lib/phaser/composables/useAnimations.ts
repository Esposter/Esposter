import type { AnimationConfiguration } from "@/lib/phaser/models/configuration/shared/AnimationConfiguration";

export const useAnimations = (configuration: AnimationConfiguration["animations"]) => {
  const animations = ref(configuration);

  onUnmounted(() => {
    animations.value = [];
  });

  return animations;
};
