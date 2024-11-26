import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";
import { Dashboard } from "@/shared/models/dashboard/data/Dashboard";

export const useDashboardStore = defineStore("dashboard", () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const dashboard = ref(new Dashboard());
  const saveDashboard = async () => {
    if (status.value === "authenticated") {
      saveItemMetadata(dashboard.value);
      await $client.dashboard.saveDashboard.mutate(dashboard.value);
    } else if (status.value === "unauthenticated") {
      saveItemMetadata(dashboard.value);
      localStorage.setItem(DASHBOARD_LOCAL_STORAGE_KEY, dashboard.value.toJSON());
    }
  };
  return { dashboard, saveDashboard };
});
