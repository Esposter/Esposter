import type { Promisable } from "type-fest";

// Deep-watch edited resource content and save on the one shared autosave cadence — the debounce, its scope
// Cleanup and its resource binding all come from useAutosaveFunction, so both autosave entry points behave alike
export const watchAutosave = (source: object, save: () => Promisable<unknown>) =>
  watchDeep(source, useAutosaveFunction(save));
