import type { ResourceType } from "@esposter/db-schema";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useDashboardStore = defineStore("dashboard", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, save, setPersistedContent } = useResource<ResourceType.Dashboard>(() =>
    getRouteParamString(route.params.id),
  );
  const dashboard = ref(new Dashboard()) as Ref<Dashboard>;
  const loadContent = async () => {
    await load();
    const data = await readContent();
    // Content crosses the wire as plain JSON (the server parses the blob with the content schema, which
    // Strips methods), so the class is rebuilt here rather than assumed — see the ToData note on the schema
    dashboard.value = new Dashboard(data as Partial<Dashboard> | undefined);
    // Seed the dirty check so the autosave watcher's load echo compares equal instead of writing back
    setPersistedContent(dashboard.value);
  };
  const saveDashboard = () => save(dashboard.value);
  return { dashboard, loadContent, saveDashboard };
});
