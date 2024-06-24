import type { Tweens } from "phaser";

export const useExperienceBarStore = defineStore("dungeons/UI/experienceBar", () => {
  const tween = ref<Tweens.Tween>();
  const isAnimating = ref(false);
  return { tween, isAnimating };
});
