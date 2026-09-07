import type { Promisable } from "type-fest";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { useResourceStore } from "@/store/resource";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { getResultAsync, noop } from "@esposter/shared";

// The one shared autosave cadence, bound to the resource that was open when the edit landed. Both halves
// Are load-bearing: useTimeoutFn drops its pending timer with the surrounding scope (VueUse's debounce arms a
// Bare setTimeout that outlives both the watcher and the blade), and the captured id refuses a write that
// Would land against a different resource — `load()` replaces the loaded resource one await before the store
// Re-seeds its content ref, so an unbound late save uploads the previous resource's content under this one's
// Id and contentVersion. Cancellation alone only shortens that window; the id closes it
export const useAutosaveFunction = (save: () => Promisable<unknown>) => {
  const { currentRoute } = useRouter();
  const resourceStore = useResourceStore();
  const { hasUnwrittenContent } = storeToRefs(resourceStore);
  const { start } = useTimeoutFn(
    getSynchronizedFunction((scheduledResourceId: string) =>
      getResultAsync(async () => {
        // Cleared before the save rather than after it: from here the write's own pending flag is what says
        // Edits are on their way, and a save this refuses is a save nothing else is going to make either
        hasUnwrittenContent.value = false;
        if (getRouteParamString(currentRoute.value.params.id) !== scheduledResourceId) return;
        await save();
      }).match(noop, console.error),
    ),
    RESOURCE_AUTOSAVE_DEBOUNCE_MS,
    { immediate: false },
  );
  return () => {
    // The debounce holds this edit for half a second and re-arms for as long as the owner keeps typing, so
    // Between the keystroke and the write there is nothing in flight to read — the toolbar would call a tab
    // Full of unwritten edits saved (/docs/platform/resource-save-state)
    hasUnwrittenContent.value = true;
    start(getRouteParamString(currentRoute.value.params.id));
  };
};
