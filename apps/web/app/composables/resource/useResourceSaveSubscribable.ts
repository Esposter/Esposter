import type { ResourceType } from "@esposter/db-schema";

import { getUnsubscribe } from "@/services/shared/getUnsubscribe";
import { useResourceStore } from "@/store/resource";
import { getRouteParam } from "@/util/router/getRouteParam";
import { getResultAsync, noop } from "@esposter/shared";

// Another device's save of the open resource, whatever its type. Every type's router serves the same stream, so one
// Subscription run by the explorer replaces a subscription per type. The store takes the save through its own door
export const useResourceSaveSubscribable = (type: ResourceType) => {
  const getResourceRouter = useResourceRouter();
  const resourceStore = useResourceStore();
  const { storeSaveResourceContent } = resourceStore;
  const { currentRoute } = useRouter();

  useOnlineSubscribable(
    () => getRouteParam(currentRoute.value.params, "id"),
    (id) => {
      if (!id) return undefined;

      return getUnsubscribe(
        getResourceRouter(type).onSaveResourceContent.subscribe(
          { id },
          {
            onData: (save) => {
              // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and a subscription callback has nothing to await it
              getResultAsync(() => storeSaveResourceContent(save)).match(noop, console.error);
            },
          },
        ),
      );
    },
  );
};
