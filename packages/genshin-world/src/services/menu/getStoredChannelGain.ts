import type { VolumeSetting } from "#src/models/menu/VolumeSetting";

import { GENSHIN_SETTINGS_DEFAULTS, GENSHIN_SETTINGS_STORAGE_KEY } from "#src/services/menu/constants";
import { getChannelGain } from "#src/services/menu/getChannelGain";
import { readGenshinSettings } from "#src/services/menu/readGenshinSettings";
import { getResult } from "@esposter/shared";

// The gain a channel plays at as the device keeps it now, for the sounds that start outside the Settings screen. A
// Blocked store is logged and read as no stored settings, so the sound plays at its default level
export const getStoredChannelGain = (channel: VolumeSetting.Music | VolumeSetting.Sfx): number => {
  const raw = getResult(() => window.localStorage.getItem(GENSHIN_SETTINGS_STORAGE_KEY))
    .orTee(console.error)
    .unwrapOr(null);
  return getChannelGain(readGenshinSettings(raw, GENSHIN_SETTINGS_DEFAULTS), channel);
};
