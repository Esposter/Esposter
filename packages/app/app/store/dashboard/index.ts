import { Dashboard } from "#shared/models/dashboard/data/Dashboard";

export const useDashboardStore = defineStore("dashboard", () => {
  const route = useRoute();
  // The store outlives the page, so the id is read from the route per call rather than captured once
  const { load, readContent, save } = useResource(() =>
    Array.isArray(route.params.id) ? (route.params.id[0] ?? "") : (route.params.id ?? ""),
  );
  const dashboard = ref(new Dashboard()) as Ref<Dashboard>;
  const loadContent = async () => {
    await load();
    const data = await readContent();
    dashboard.value = new Dashboard((data as Partial<Dashboard> | undefined) ?? undefined);
  };
  const saveDashboard = () => save(dashboard.value);
  return { dashboard, loadContent, saveDashboard };
});
