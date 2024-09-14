import { AnimationsSetting } from "@/models/dungeons/data/settings/AnimationsSetting";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { useDungeonsStore } from "@/store/dungeons";

export const useSettingsStore = defineStore("dungeons/settings", () => {
  const dungeonsStore = useDungeonsStore();
  const { saveGame } = dungeonsStore;
  const settings = computed({
    get: () => dungeonsStore.game.settings,
    set: (newSettings) => {
      dungeonsStore.game.settings = newSettings;
    },
  });
  const setSettings = async (
    settingsOption: Exclude<SettingsOption, SettingsOption.Close>,
    value: (typeof settings.value)[typeof settingsOption],
  ) => {
    // Doing this casting hack here because we'll assume that
    // the correct settings option + value will always be passed in
    settings.value[settingsOption] = value as never;
    await saveGame();
  };
  const isSkipAnimations = computed(() => settings.value[SettingsOption.Animations] === AnimationsSetting.Off);
  const isSkipEncounters = ref(false);
  return {
    isSkipAnimations,
    isSkipEncounters,
    setSettings,
    settings,
  };
});
