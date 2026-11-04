import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { createContentData } from "@/services/resource/createContentData";
import { ResourceType } from "@esposter/db-schema";

export const useDashboardStore = defineStore("dashboard", () => {
  const {
    content: dashboard,
    loadContent,
    saveContent: saveDashboard,
  } = createContentData<ResourceType.Dashboard, Dashboard>(
    ResourceType.Dashboard,
    // Content crosses the wire as plain JSON (the server parses the blob with the content schema, which
    // Strips methods), so the class is rebuilt here rather than assumed — see the ToData note on the schema
    (data) => new Dashboard(data as Partial<Dashboard> | undefined),
  );
  // The layout settings are written onto the dashboard they were chosen on, and taken back there if the save is refused
  const setLayout = async (layout: Pick<Dashboard, "collision" | "compactType">) => {
    const target = dashboard.value;
    const previousLayout = { collision: target.collision, compactType: target.compactType };
    Object.assign(target, layout);
    const isSuccessful = await saveDashboard();
    if (!isSuccessful) Object.assign(target, previousLayout);
    return isSuccessful;
  };
  return { dashboard, loadContent, saveDashboard, setLayout };
});
