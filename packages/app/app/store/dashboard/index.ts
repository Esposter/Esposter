import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { getRouteParamString } from "@/util/router/getRouteParamString";

export const useDashboardStore = defineStore("dashboard", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, save } = useResource(() => getRouteParamString(route.params.id));
  const dashboard = ref(new Dashboard()) as Ref<Dashboard>;
  const loadContent = async () => {
    await load();
    const data = await readContent();
    dashboard.value = new Dashboard((data as Partial<Dashboard> | undefined) ?? undefined);
  };
  const saveDashboard = () => save(dashboard.value);
  return { dashboard, loadContent, saveDashboard };
});
