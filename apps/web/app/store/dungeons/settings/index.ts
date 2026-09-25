import type { Settings } from "#shared/models/dungeons/data/settings/Settings";

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
  // Generic in the option so its value is typed by that option alone, and a value belonging to another cannot be
  // Passed with it
  const setSettings = async <TSettingsOption extends keyof Settings>(
    settingsOption: TSettingsOption,
    value: Settings[TSettingsOption],
  ) => {
    settings.value[settingsOption] = value;
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
