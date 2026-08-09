import type { ResourceType } from "@esposter/db-schema";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { useResourceStore } from "@/store/resource";

export const useDashboardStore = defineStore("dashboard", () => {
  const resourceStore = useResourceStore();
  const { readContent, readResource, saveContent, setPersistedContent } = resourceStore;
  const dashboard = ref(new Dashboard()) as Ref<Dashboard>;
  const loadContent = async () => {
    await readResource();
    const data = await readContent<ResourceType.Dashboard>();
    // Content crosses the wire as plain JSON (the server parses the blob with the content schema, which
    // Strips methods), so the class is rebuilt here rather than assumed — see the ToData note on the schema
    dashboard.value = new Dashboard(data as Partial<Dashboard> | undefined);
    // Seed the dirty check so the autosave watcher's load echo compares equal instead of writing back
    setPersistedContent(dashboard.value);
  };
  const saveDashboard = () => saveContent(dashboard.value);
  return { dashboard, loadContent, saveDashboard };
});
