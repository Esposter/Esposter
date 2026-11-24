import { useResourceStore } from "#src/store/resource/index";

// The read of the resource the page has open. executeQuery watches the topics the row names for as long as this page is
// Mounted, so a change to the resource runs the read again. The store is app-lifetime, so a watch held there would
// Outlive the page and keep reading a resource nothing shows. The store's readOpenResource owns the route guard and the
// Check that the route still names the resource when the answer lands; this page's executor is what holds the watch
export const useReadOpenResource = () => {
  const resourceStore = useResourceStore();
  const { applyResource, readOpenResource } = resourceStore;
  const { executeQuery, isPending } = useMutation();
  const runScope = useRunScope();
  // The open resource is one target, so its run scope orders the reads: a newer read of it aborts the one before it
  const key = Symbol("readOpenResource");
  const readResource = () =>
    readOpenResource(executeQuery, {
      key,
      // Logs and does not throw: a watch re-runs these same options with no caller to rethrow to, so a throw here would
      // Be an unhandled rejection. The page's own failure still reaches its caller through rethrowFailedRead
      onError: console.error,
      onRead: applyResource,
      runScope,
    });
  return { isPending, readResource };
};
