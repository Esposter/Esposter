import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { GENSHIN_SETTINGS_DEFAULTS, GENSHIN_SETTINGS_STORAGE_KEY } from "#src/services/menu/constants";
import { readGenshinSettings } from "#src/services/menu/readGenshinSettings";
import { getResult } from "@esposter/shared";

// The settings as the device keeps them now, for the systems that start outside the Settings screen. A blocked store is
// Logged and read as no stored settings, so the defaults stand
export const getStoredGenshinSettings = (): GenshinSettings => {
  const raw = getResult(() => window.localStorage.getItem(GENSHIN_SETTINGS_STORAGE_KEY))
    .orTee(console.error)
    .unwrapOr(null);
  return readGenshinSettings(raw, GENSHIN_SETTINGS_DEFAULTS);
};
