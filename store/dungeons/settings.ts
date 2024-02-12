import { IS_DEVELOPMENT } from "@/util/environment/constants";

export const useSettingsStore = defineStore("dungeons/settings", () => {
  const isSkipBattleAnimations = ref(IS_DEVELOPMENT);
  const isSkipEncounters = ref(false);
  const debugTileLayerAlpha = ref(IS_DEVELOPMENT ? 0.7 : 0);
  return { isSkipBattleAnimations, isSkipEncounters, debugTileLayerAlpha };
});
