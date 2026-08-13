import type { Promisable } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { getRouteParamString } from "@/util/router/getRouteParamString";

// The one shared autosave cadence, bound to the resource that was open when the edit landed. Both halves
// Are load-bearing: useTimeoutFn drops its pending timer with the surrounding scope (VueUse's debounce arms a
// Bare setTimeout that outlives both the watcher and the blade), and the captured id refuses a write that
// Would land against a different resource — `load()` replaces the loaded resource one await before the store
// Re-seeds its content ref, so an unbound late save uploads the previous resource's content under this one's
// Id and contentVersion. Cancellation alone only shortens that window; the id closes it
export const useAutosaveFn = (save: () => Promisable<unknown>) => {
  const { currentRoute } = useRouter();
  const { start } = useTimeoutFn(
    getSynchronizedFunction(async (scheduledResourceId: string) => {
      if (getRouteParamString(currentRoute.value.params.id) !== scheduledResourceId) return;
      await save();
    }),
    RESOURCE_AUTOSAVE_DEBOUNCE_MS,
    { immediate: false },
  );
  return () => {
    start(getRouteParamString(currentRoute.value.params.id));
  };
};
