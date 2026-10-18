import type { GenshinSettings } from "#src/models/menu/GenshinSettings";

import { GENSHIN_SETTINGS_STORAGE_KEY } from "#src/services/menu/constants";
import { readGenshinSettings } from "#src/services/menu/readGenshinSettings";
import { useLocalStorage } from "@vueuse/core";

// The settings the device keeps, read over the given defaults, as a ref the Settings screen and the world write back
export const useStoredGenshinSettings = (
  defaults: GenshinSettings,
  options: { listenToStorageChanges?: boolean } = {},
) =>
  useLocalStorage<GenshinSettings>(GENSHIN_SETTINGS_STORAGE_KEY, defaults, {
    ...options,
    serializer: { read: (raw) => readGenshinSettings(raw, defaults), write: (value) => JSON.stringify(value) },
    writeDefaults: false,
  });
