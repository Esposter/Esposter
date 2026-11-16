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
    (data) => new Dashboard(data as Partial<Dashboard> | undefined),
  );
  // The layout settings are written onto the dashboard they were chosen on, and taken back there if the save is refused.
  // Saves queue, so a setting a later write changed since is that write's to keep
  const setLayout = (layout: Pick<Dashboard, "collision" | "compactType">) => {
    const target = dashboard.value;
    const previousLayout = { collision: target.collision, compactType: target.compactType };
    Object.assign(target, layout);
    saveDashboard(() => {
      if (target.collision === layout.collision) target.collision = previousLayout.collision;
      if (target.compactType === layout.compactType) target.compactType = previousLayout.compactType;
    });
  };
  return { dashboard, loadContent, saveDashboard, setLayout };
});
