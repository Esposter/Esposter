import type { VolumeSetting } from "#src/models/menu/VolumeSetting";

import { GENSHIN_SETTINGS_DEFAULTS, GENSHIN_SETTINGS_STORAGE_KEY } from "#src/services/menu/constants";
import { getChannelGain } from "#src/services/menu/getChannelGain";
import { GENSHIN_SETTINGS_STORAGE_OPTIONS } from "#src/services/menu/getStoredGenshinSettings";
import { useLocalStorage } from "@vueuse/core";
import { watch } from "vue";

// Sets a channel's gain to the level the device's stored settings give it, now and after each change to them, whether made
// On this device by the Settings screen or in another tab sharing the store. The channel's bus is made at its level first
export const followChannelGain = (gain: GainNode, channel: VolumeSetting.Music | VolumeSetting.Sfx): void => {
  const settings = useLocalStorage(
    GENSHIN_SETTINGS_STORAGE_KEY,
    GENSHIN_SETTINGS_DEFAULTS,
    GENSHIN_SETTINGS_STORAGE_OPTIONS,
  );
  watch(
    () => getChannelGain(settings.value, channel),
    (channelGain) => {
      gain.gain.value = channelGain;
    },
    { immediate: true },
  );
};
