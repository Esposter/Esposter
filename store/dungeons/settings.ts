export const useSettingsStore = defineStore("dungeons/settings", () => {
  const isSkipBattleAnimations = ref(false);
  return { isSkipBattleAnimations };
});
