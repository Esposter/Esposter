import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { TextSpeedDelayMsMap } from "@/services/dungeons/scene/settings/TextSpeedDelayMsMap";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useTextDelayMs = (delayMs?: number) => {
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  return computed(() => delayMs ?? TextSpeedDelayMsMap[settings.value[SettingsOption["Text Speed"]]]);
};
