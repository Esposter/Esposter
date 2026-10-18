import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { UseStorageOptions } from "@vueuse/core";

import { GENSHIN_SETTINGS_DEFAULTS, GENSHIN_SETTINGS_STORAGE_KEY } from "#src/services/menu/constants";
import { readGenshinSettings } from "#src/services/menu/readGenshinSettings";
import { useLocalStorage } from "@vueuse/core";

// How the settings are read from and written to the device's store, the same for every reader of them
export const GENSHIN_SETTINGS_STORAGE_OPTIONS: UseStorageOptions<GenshinSettings> = {
  serializer: {
    read: (raw) => readGenshinSettings(raw, GENSHIN_SETTINGS_DEFAULTS),
    write: (value) => JSON.stringify(value),
  },
  writeDefaults: false,
};

// The settings as the device keeps them now, for the systems that start outside the Settings screen. A blocked store is
// Logged and read as no stored settings, so the defaults stand
export const getStoredGenshinSettings = (): GenshinSettings =>
  useLocalStorage<GenshinSettings>(GENSHIN_SETTINGS_STORAGE_KEY, GENSHIN_SETTINGS_DEFAULTS, {
    ...GENSHIN_SETTINGS_STORAGE_OPTIONS,
    listenToStorageChanges: false,
  }).value;
