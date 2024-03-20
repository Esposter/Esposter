import { TextSpeedSetting } from "@/models/dungeons/data/settings/TextSpeedSetting";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { useSettingsStore } from "@/store/dungeons/settings";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";

// @ts-expect-error Typescript doesn't check switch statements properly
export const useTextDelay = (delay?: number): number => {
  if (delay) return delay;

  const settingsStore = useSettingsStore();
  const { settings } = storeToRefs(settingsStore);
  const textSpeedSetting = computed(() => settings.value[SettingsOption["Text Speed"]]);

  switch (textSpeedSetting.value) {
    case TextSpeedSetting.Fast:
      return 50;
    case TextSpeedSetting.Mid:
      return 30;
    case TextSpeedSetting.Slow:
      return 15;
    default:
      exhaustiveGuard(textSpeedSetting.value);
  }
};
