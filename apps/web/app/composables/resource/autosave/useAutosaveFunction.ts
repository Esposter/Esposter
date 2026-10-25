import type { Promisable } from "type-fest";

import { RESOURCE_AUTOSAVE_DEBOUNCE_MS } from "@/services/resource/constants";
import { useResourceStore } from "@/store/resource";
import { getRouteParam } from "@/util/router/getRouteParam";
import { getResultAsync, getSynchronizedFunction, noop } from "@esposter/shared";

// The one shared autosave cadence, bound to the resource that was open when the edit landed. The binding refuses a
// Write that would land against a different resource — `load()` replaces the loaded resource one await before the store
// Re-seeds its content ref, so an unbound late save uploads the previous resource's content under this one's id and
// ContentVersion. Leaving the editor writes the edit still held, before the route changes, so that write still names
// Its resource: an edit is saved on the way out rather than dropped with the debounce's timer
export const useAutosaveFunction = (save: () => Promisable<unknown>) => {
  const { beforeEach, currentRoute } = useRouter();
  const resourceStore = useResourceStore();
  const { unwrittenContentResourceId } = storeToRefs(resourceStore);
  // The resource the held edit was made on, until its write starts
  let pendingResourceId: string | undefined;
  const writePending = async () => {
    const scheduledResourceId = pendingResourceId;
    pendingResourceId = undefined;
    if (scheduledResourceId === undefined) return;

    await getResultAsync(async () => {
      if (getRouteParam(currentRoute.value.params, "id") !== scheduledResourceId) return;
      await save();
    }).match(noop, console.error);
  };
  const writePendingInBackground = getSynchronizedFunction(writePending);
  const { start } = useTimeoutFn(writePendingInBackground, RESOURCE_AUTOSAVE_DEBOUNCE_MS, { immediate: false });
  // A blade closed while its resource stays open writes the edit it holds, so the debounce's timer going with the
  // Scope does not drop it
  tryOnScopeDispose(writePendingInBackground);
  // Every navigation writes the edit it holds before the route changes, whether it leaves the resource or only
  // Changes the one it names, since a leave guard alone misses a change of id within the same route. An edit typed
  // While that write is in flight is still held for the route the guard runs on, so the guard writes until none is left
  const writeHeldEdits = async (): Promise<void> => {
    if (pendingResourceId === undefined) return;

    await writePending();
    await writeHeldEdits();
  };
  tryOnScopeDispose(beforeEach(writeHeldEdits));

  return () => {
    // The debounce holds this edit for half a second and re-arms for as long as the owner keeps typing, so
    // Between the keystroke and the write there is nothing in flight to read — the toolbar would call a tab
    // Full of unwritten edits saved (openspec/specs/resource/resource-save-state/design.md). Only set here: `saveContent` is the
    // One door every save goes through, so clearing it is its, and a save this refuses never reaches it — which
    // Is the point, since a refused save is an edit that was dropped rather than one that landed
    const resourceId = getRouteParam(currentRoute.value.params, "id");
    unwrittenContentResourceId.value = resourceId;
    pendingResourceId = resourceId;
    start();
  };
};
