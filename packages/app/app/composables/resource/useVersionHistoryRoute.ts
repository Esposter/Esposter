import type { LocationQueryRaw } from "vue-router";

import { getRouteParamString } from "@/util/router/getRouteParamString";

// The version history panel's place in the route, which is what makes it deep-linkable: the back button, a
// Refresh and a shared link all land on the same panel over the same version, because none of it is state the
// Panel keeps to itself. `versions` says the panel is open; `version` names the snapshot being previewed in
// Place of the blade. See /docs/platform/resource-snapshots
export const useVersionHistoryRoute = () => {
  const { currentRoute } = useRouter();
  const isVersionHistoryOpen = computed(() => currentRoute.value.query.versions !== undefined);
  const previewSnapshotVersionId = computed(() => getRouteParamString(currentRoute.value.query.version));
  // Merged rather than replaced: the blade route carries whatever else its own surfaces put there, and a
  // Param set to undefined is the router's own way of dropping one
  const setVersionHistoryQuery = async (query: LocationQueryRaw) => {
    await navigateTo({ query: { ...currentRoute.value.query, ...query } });
  };
  return {
    closeVersionHistory: () => setVersionHistoryQuery({ version: undefined, versions: undefined }),
    isVersionHistoryOpen,
    openVersionHistory: () => setVersionHistoryQuery({ versions: null }),
    previewSnapshot: (snapshotVersionId: string) =>
      setVersionHistoryQuery({ version: snapshotVersionId, versions: null }),
    previewSnapshotVersionId,
    // Back to current leaves the panel open, because stepping through candidates is the whole point of
    // Previewing in place rather than navigating to a version and back
    stopPreviewingSnapshot: () => setVersionHistoryQuery({ version: undefined }),
  };
};
