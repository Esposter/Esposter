import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { authClient } from "@/services/auth/authClient";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useDashboardStore = defineStore("dashboard", () => {
  const { $trpc } = useNuxtApp();
  const dashboard = ref(new Dashboard());
  const saveDashboard = async () => {
    const session = authClient.useSession();

    if (session.value.data) {
      saveItemMetadata(dashboard.value);
      await $trpc.dashboard.saveDashboard.mutate(dashboard.value);
    } else {
      saveItemMetadata(dashboard.value);
      localStorage.setItem(DASHBOARD_LOCAL_STORAGE_KEY, dashboard.value.toJSON());
    }
  };
  return { dashboard, saveDashboard };
});
