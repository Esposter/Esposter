import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";

export const useDashboardStore = defineStore("dashboard", () => {
  const { $trpc } = useNuxtApp();
  const dashboard = ref(new Dashboard());
  const saveDashboard = useSave(dashboard, {
    auth: { save: $trpc.dashboard.saveDashboard.mutate },
    unauth: { key: DASHBOARD_LOCAL_STORAGE_KEY, schema: dashboardSchema },
  });
  return { dashboard, saveDashboard };
});
