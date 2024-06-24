import type { Tweens } from "phaser";

export const useExperienceBarStore = defineStore("dungeons/UI/experienceBar", () => {
  const tween = ref<Tweens.Tween>();
  return { tween };
});
