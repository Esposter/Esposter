import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { useStoredGenshinSettings } from "#src/composables/useStoredGenshinSettings";
import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";

// The settings as the device keeps them now, for the systems that start outside the Settings screen. A blocked store is
// Logged and read as no stored settings, so the defaults stand
export const getStoredGenshinSettings = (): GenshinSettings =>
  useStoredGenshinSettings(GENSHIN_SETTINGS_DEFAULTS, { listenToStorageChanges: false }).value;
