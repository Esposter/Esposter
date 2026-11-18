import { checkIsUuidV7 } from "#shared/services/id/checkIsUuidV7";
import { rethrowFailedRead } from "#src/services/shared/rethrowFailedRead";
import { useResourceStore } from "#src/store/resource/index";
import { getRouteParam } from "#src/util/router/getRouteParam";

// The read of the resource the page has open. executeQuery watches the topics the row names for as long as this page is
// Mounted, so a change to the resource runs the read again. The store is app-lifetime, so a watch held there would outlive
// The page and keep reading a resource nothing shows
export const useReadOpenResource = () => {
  const { $trpc } = useNuxtApp();
  const { currentRoute } = useRouter();
  const resourceStore = useResourceStore();
  const { applyResource } = resourceStore;
  const { executeQuery, isPending } = useMutation();
  // The open resource is one target, so every read of it supersedes the one before it
  const key = Symbol("readOpenResource");
  const readResource = async () => {
    // Resolved per call rather than captured: the read takes whichever resource the route names when it runs
    const id = getRouteParam(currentRoute.value.params, "id");
    // A route with no resource segment — a list view, or one this read raced a navigation to — names nothing to read,
    // And the empty sentinel would reach the server as a uuid that fails validation
    if (!checkIsUuidV7(id)) return;

    await rethrowFailedRead(
      executeQuery(() => $trpc.resource.readResource.query({ id }), {
        key,
        // Logs and does not throw: a watch re-runs these same options with no caller to rethrow to, so a throw here would
        // Be an unhandled rejection. The page's own failure still reaches its caller through rethrowFailedRead
        onError: console.error,
        onSuccess: ({ publication, ...fetchedResource }) => {
          // Reads for two resources are not one target, so a navigation away can let the earlier one land last
          if (getRouteParam(currentRoute.value.params, "id") !== id) return;

          applyResource(fetchedResource, publication);
        },
      }),
    );
  };
  return { isPending, readResource };
};
