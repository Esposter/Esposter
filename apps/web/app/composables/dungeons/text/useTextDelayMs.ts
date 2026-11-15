import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { TextSpeedDelayMsMap } from "#src/services/dungeons/scene/settings/TextSpeedDelayMsMap";
import { useSettingsStore } from "#src/store/dungeons/settings/index";

export const useTextDelayMs = () => {
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  return computed(() => TextSpeedDelayMsMap[settings.value[SettingsOption["Text Speed"]]]);
};
