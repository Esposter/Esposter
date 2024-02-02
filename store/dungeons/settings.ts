export const useSettingsStore = defineStore("dungeons/settings", () => {
  const isSkipBattleAnimations = ref(true);
  return { isSkipBattleAnimations };
});
