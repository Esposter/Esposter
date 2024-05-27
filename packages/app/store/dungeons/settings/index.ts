import { AnimationsSetting } from "@/models/dungeons/data/settings/AnimationsSetting";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { useDungeonsStore } from "@/store/dungeons";

export const useSettingsStore = defineStore("dungeons/settings", () => {
  const dungeonsStore = useDungeonsStore();
  const { saveGame } = dungeonsStore;
  const { game } = storeToRefs(dungeonsStore);
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
  return {
    settings,
    setSettings,
    isSkipAnimations,
    isSkipEncounters,
  };
});
