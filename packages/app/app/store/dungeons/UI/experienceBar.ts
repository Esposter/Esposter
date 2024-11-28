export const useExperienceBarStore = defineStore("dungeons/UI/experienceBar", () => {
  const isAnimating = ref(false);
  const isSkipAnimations = ref(false);
  return { isAnimating, isSkipAnimations };
});
