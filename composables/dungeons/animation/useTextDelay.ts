import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { TextSpeedDelayMap } from "@/services/dungeons/settings/TextSpeedDelayMap";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useTextDelay = (delay?: number) => {
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  const textSpeedSetting = computed(() => settings.value[SettingsOption["Text Speed"]]);
  return computed(() => delay ?? TextSpeedDelayMap[textSpeedSetting.value]);
};
