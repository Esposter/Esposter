import { AnimationsOption } from "@/models/dungeons/settings/AnimationsOption";
import { BattleStyleOption } from "@/models/dungeons/settings/BattleStyleOption";
import { MenuColorOption } from "@/models/dungeons/settings/MenuColorOption";
import { PlayerSettingsOption } from "@/models/dungeons/settings/PlayerSettingsOption";
import { SoundOption } from "@/models/dungeons/settings/SoundOption";
import { TextSpeedOption } from "@/models/dungeons/settings/TextSpeedOption";
import { IS_DEVELOPMENT } from "@/util/environment/constants";

export const useSettingsStore = defineStore("dungeons/settings", () => {
  const settings = ref<Record<Exclude<PlayerSettingsOption, PlayerSettingsOption.Close>, string | number>>({
    [PlayerSettingsOption["Text Speed"]]: TextSpeedOption.Mid,
    [PlayerSettingsOption.Animations]: AnimationsOption.On,
    [PlayerSettingsOption["Battle Style"]]: BattleStyleOption.Shift,
    [PlayerSettingsOption.Sound]: SoundOption.On,
    [PlayerSettingsOption.Volume]: 100,
    [PlayerSettingsOption["Menu Color"]]: MenuColorOption.White,
  });
  const isSkipAnimations = computed(
    () => IS_DEVELOPMENT || settings.value[PlayerSettingsOption.Animations] === AnimationsOption.On,
  );
  const isSkipEncounters = ref(false);
  const debugTileLayerAlpha = ref(IS_DEVELOPMENT ? 0.7 : 0);
  return {
    settings,
    isSkipAnimations,
    isSkipEncounters,
    debugTileLayerAlpha,
  };
});
