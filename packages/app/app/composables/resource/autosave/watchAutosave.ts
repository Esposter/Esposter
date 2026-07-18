import type { Promisable } from "type-fest";

import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";

// Deep-watch edited resource content and save on the one shared autosave cadence
export const watchAutosave = (source: object, save: () => Promisable<unknown>) =>
  watchDebounced(source, save, { debounce: RESOURCE_AUTOSAVE_DEBOUNCE_MS, deep: true });
