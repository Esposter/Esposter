import type { Promisable } from "type-fest";

import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";

// Event-driven twin of watchAutosave for per-frame emitters (e.g. VueFlow) — same shared cadence
export const useAutosaveFn = (save: () => Promisable<unknown>) => useDebounceFn(save, RESOURCE_AUTOSAVE_DEBOUNCE_MS);
