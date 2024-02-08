import { IS_DEVELOPMENT } from "@/util/environment/constants";

export const useSettingsStore = defineStore("dungeons/settings", () => {
  const isSkipBattleAnimations = ref(IS_DEVELOPMENT);
  return { isSkipBattleAnimations };
});
