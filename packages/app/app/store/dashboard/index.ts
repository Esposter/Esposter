import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { authClient } from "@/services/auth/authClient";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { saveItemMetadata } from "@/services/shared/saveItemMetadata";

export const useDashboardStore = defineStore("dashboard", () => {
  const { $client } = useNuxtApp();
  const dashboard = ref(new Dashboard());
  const saveDashboard = async () => {
    const { data: session } = await authClient.useSession(useFetch);

    if (session.value) {
      saveItemMetadata(dashboard.value);
      await $client.dashboard.saveDashboard.mutate(dashboard.value);
    } else {
      saveItemMetadata(dashboard.value);
      localStorage.setItem(DASHBOARD_LOCAL_STORAGE_KEY, dashboard.value.toJSON());
    }
  };
  return { dashboard, saveDashboard };
});
