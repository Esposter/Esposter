import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { TextSpeedDelayMap } from "@/services/dungeons/scene/settings/TextSpeedDelayMap";
import { useSettingsStore } from "@/store/dungeons/settings";

export const useTextDelay = (delay?: number) => {
  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  return computed(() => delay ?? TextSpeedDelayMap[settings.value[SettingsOption["Text Speed"]]]);
};
