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
  const { armAutosave, disarmAutosave } = resourceStore;
  // Edits that exist only in the tab are what the toolbar calls "Saving", so the window between the keystroke
  // And the write counts as part of it. Held per instance rather than per call: the timer is re-armed on every
  // Keystroke and a second arm for one already-armed instance would leave the count stuck above zero
  let isArmed = false;
  const disarm = () => {
    if (!isArmed) return;

    isArmed = false;
    disarmAutosave();
  };
  // A blade that closes mid-debounce drops its timer with the scope, so the count it claimed has to unwind
  // With it — otherwise the next resource opens reporting a save that is never coming
  onScopeDispose(disarm);
  const { start } = useTimeoutFn(
    getSynchronizedFunction((scheduledResourceId: string) =>
      getResultAsync(async () => {
        disarm();
        if (getRouteParamString(currentRoute.value.params.id) !== scheduledResourceId) return;
        await save();
      }).match(noop, console.error),
    ),
    RESOURCE_AUTOSAVE_DEBOUNCE_MS,
    { immediate: false },
  );
  return () => {
    if (!isArmed) {
      isArmed = true;
      armAutosave();
    }
    start(getRouteParamString(currentRoute.value.params.id));
  };
};
