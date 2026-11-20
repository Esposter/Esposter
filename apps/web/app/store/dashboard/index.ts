import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { createContentData } from "#src/services/resource/createContentData";
import { ResourceType } from "@esposter/db-schema";

export const useDashboardStore = defineStore("dashboard", () => {
  const {
    content: dashboard,
    loadContent,
    saveContent: saveDashboard,
  } = createContentData<typeof ResourceType.Dashboard, Dashboard>(
    ResourceType.Dashboard,
    // Content crosses the wire as plain JSON (the server parses the blob with the content schema, which
    // Strips methods), so the class is rebuilt here rather than assumed — see the ToData note on the schema
    (data) => new Dashboard(data),
  );
  // The layout settings are written onto the dashboard they were chosen on, and saved in order behind the writes ahead
  const setLayout = (layout: Pick<Dashboard, "collision" | "compactType">) => {
    Object.assign(dashboard.value, layout);
    saveDashboard();
  };
  return { dashboard, loadContent, saveDashboard, setLayout };
});
