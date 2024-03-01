import { AnimationsOption } from "@/models/dungeons/settings/AnimationsOption";
import { BattleStyleOption } from "@/models/dungeons/settings/BattleStyleOption";
import { MenuColorOption } from "@/models/dungeons/settings/MenuColorOption";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { SoundOption } from "@/models/dungeons/settings/SoundOption";
import { TextSpeedOption } from "@/models/dungeons/settings/TextSpeedOption";
import { IS_DEVELOPMENT } from "@/util/environment/constants";

export const useSettingsStore = defineStore("dungeons/settings", () => {
  const settings = ref<Record<Exclude<SettingsOption, SettingsOption.Close>, string | number>>({
    [SettingsOption["Text Speed"]]: TextSpeedOption.Mid,
    [SettingsOption.Animations]: AnimationsOption.On,
    [SettingsOption["Battle Style"]]: BattleStyleOption.Shift,
    [SettingsOption.Sound]: SoundOption.On,
    [SettingsOption.Volume]: 100,
    [SettingsOption["Menu Color"]]: MenuColorOption.Blue,
  });
  const setSettings = (settingsOption: keyof typeof settings.value, value: string | number) => {
    settings.value[settingsOption] = value;
  };
  const isSkipAnimations = computed(
    () => IS_DEVELOPMENT || settings.value[SettingsOption.Animations] === AnimationsOption.On,
  );
  const isSkipEncounters = ref(false);
  const debugTileLayerAlpha = ref(IS_DEVELOPMENT ? 0.7 : 0);
  return {
    settings,
    setSettings,
    isSkipAnimations,
    isSkipEncounters,
    debugTileLayerAlpha,
  };
});
