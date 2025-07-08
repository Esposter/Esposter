import { TextSpeedDelayMap } from "@/services/dungeons/scene/settings/TextSpeedDelayMap";
import { useSettingsStore } from "@/store/dungeons/settings";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";

export const useTextDelay = (delay?: number) => {
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  const textSpeedSetting = computed(() => settings.value[SettingsOption["Text Speed"]]);
  return computed(() => delay ?? TextSpeedDelayMap[textSpeedSetting.value]);
};
