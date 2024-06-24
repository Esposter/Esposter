export const useExperienceBarStore = defineStore("dungeons/UI/experienceBar", () => {
  const isRunningLevelUpAnimation = ref(false);
  return { isRunningLevelUpAnimation };
});
