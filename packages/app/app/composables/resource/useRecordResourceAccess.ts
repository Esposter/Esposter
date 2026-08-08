import type { Resource } from "@esposter/db-schema";

import { noop } from "@esposter/shared";

// Feeds the Recent list route, Home's Recent tab and the search dropdown's Recently opened group.
export const useRecordResourceAccess = (resource: Ref<Resource | undefined>) => {
  const { $trpc } = useNuxtApp();
  const { executeMutation } = useMutation();

  // Watches the identity, not the object: every autosave, rename and tag edit replaces the ref with a new
  // Object, and re-recording on those would order Recent by last autosave rather than last open — this
  // Records what you opened, not what happened to it while it was open
  watchImmediate(
    () => resource.value?.id,
    async (id) => {
      if (!id) return;

      // Silent on failure: this is a record of the visit, and the visit itself succeeded. An alert here would
      // Report a problem on a page that opened perfectly well
      await executeMutation(() => $trpc.resource.recordAccess.mutate({ id }), { key: id, onError: noop });
    },
  );
};
