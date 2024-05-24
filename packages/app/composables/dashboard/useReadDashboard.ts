import { Dashboard } from "@/models/dashboard/Dashboard";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { useDashboardStore } from "@/store/dashboard";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const useReadDashboard = async () => {
  const { $client } = useNuxtApp();
  const dashboardStore = useDashboardStore();
  const { dashboard } = storeToRefs(dashboardStore);

  await useReadData(
    () => {
      const dashboardJson = localStorage.getItem(DASHBOARD_LOCAL_STORAGE_KEY);
      if (dashboardJson) dashboard.value = new Dashboard(jsonDateParse(dashboardJson));
      else dashboard.value = new Dashboard();
    },
    async () => {
      dashboard.value = await $client.dashboard.readDashboard.query();
    },
  );
};
