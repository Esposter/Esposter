import { useConnectionStore } from "@/store/realtime/connection";
import { useResourceStore } from "@/store/resource";
import { getRouteParam } from "@/util/router/getRouteParam";
import { getResultAsync, noop } from "@esposter/shared";

// Another device's save of the open resource, whatever its type. The user socket carries every type's save, so one
// Registration serves the explorer, and a save is taken only when it names the resource this page is on. The store
// Takes the save through its own door
export const useResourceSaveSubscribable = () => {
  const resourceStore = useResourceStore();
  const { storeSaveResourceContent } = resourceStore;
  const connectionStore = useConnectionStore();
  const { onUserEvent } = connectionStore;
  const { currentRoute } = useRouter();
  const unregister = onUserEvent("saveResourceContent", (save) => {
    const routeId = getRouteParam(currentRoute.value.params, "id");
    if (save.id !== routeId) return;
    // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and a subscription callback has nothing to await it
    getResultAsync(() => storeSaveResourceContent(save)).match(noop, console.error);
  });
  onScopeDispose(unregister);
};
