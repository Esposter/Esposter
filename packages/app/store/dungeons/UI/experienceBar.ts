import { useSettingsStore } from "@/store/dungeons/settings";

export const useExperienceBarStore = defineStore("dungeons/UI/experienceBar", () => {
  const isAnimating = ref(false);
  const settingsStore = useSettingsStore();
  const { isSkipAnimations: isSettingsSkipAnimations } = storeToRefs(settingsStore);
  const isManualSkipAnimations = ref(false);
  const isSkipAnimations = computed(() => isSettingsSkipAnimations.value || isManualSkipAnimations.value);
  return { isAnimating, isManualSkipAnimations, isSkipAnimations };
});
