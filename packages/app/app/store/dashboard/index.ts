import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { authClient } from "@/services/auth/authClient";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { saveItemMetadata } from "@/services/shared/metadata/saveItemMetadata";

export const useDashboardStore = defineStore("dashboard", () => {
  const session = authClient.useSession();
  const { $trpc } = useNuxtApp();
  const saveToLocalStorage = useSaveToLocalStorage();
  const dashboard = ref(new Dashboard());
  const saveDashboard = async () => {
    saveItemMetadata(dashboard.value);
    if (session.value.data) await $trpc.dashboard.saveDashboard.mutate(dashboard.value);
    else saveToLocalStorage(DASHBOARD_LOCAL_STORAGE_KEY, dashboardSchema, dashboard.value);
  };
  return { dashboard, saveDashboard };
});
