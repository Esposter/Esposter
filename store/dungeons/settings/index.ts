import { AnimationsSetting } from "@/models/dungeons/data/settings/AnimationsSetting";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { useGameStore } from "@/store/dungeons/game";
import { IS_DEVELOPMENT } from "@/util/environment/constants";

export const useSettingsStore = defineStore("dungeons/settings", () => {
  const gameStore = useGameStore();
  const { saveGame } = gameStore;
  const { game } = storeToRefs(gameStore);
  const settings = computed({
    get: () => game.value.settings,
    set: (newSettings) => {
      game.value.settings = newSettings;
    },
  });
  const setSettings = async (
    settingsOption: keyof typeof settings.value,
    value: (typeof settings.value)[typeof settingsOption],
  ) => {
    // Doing this casting hack here because we'll assume
    // that the correct settings option + value will be passed in
    settings.value[settingsOption] = value as never;
    await saveGame();
  };
  const isSkipAnimations = computed(() => settings.value[SettingsOption.Animations] === AnimationsSetting.Off);
  const isSkipEncounters = ref(false);
  const debugTileLayerAlpha = ref(IS_DEVELOPMENT ? 0.7 : 0);
  return {
    settings,
    setSettings,
    isSkipAnimations,
    isSkipEncounters,
    debugTileLayerAlpha,
  };
});
