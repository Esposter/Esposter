import { AnimationsSetting } from "#shared/models/dungeons/data/settings/AnimationsSetting";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { useDungeonsStore } from "@/store/dungeons";

export const useSettingsStore = defineStore("dungeons/settings", () => {
  const dungeonsStore = useDungeonsStore();
  const { saveDungeons } = dungeonsStore;
  const settings = computed({
    get: () => dungeonsStore.dungeons.settings,
    set: (newSettings) => {
      dungeonsStore.dungeons.settings = newSettings;
    },
  });
  const setSettings = async (
    settingsOption: Exclude<SettingsOption, SettingsOption.Close>,
    value: (typeof settings.value)[typeof settingsOption],
  ) => {
    // Doing this casting hack here because we'll assume that
    // the correct settings option + value will always be passed in
    settings.value[settingsOption] = value as never;
    await saveDungeons();
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
