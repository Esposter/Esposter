import { Dashboard } from "@/models/dashboard/Dashboard";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { useDashboardStore } from "@/store/dashboard";
import { jsonDateParse } from "@/util/time/jsonDateParse";
import deepEqual from "deep-equal";

export const useReadDashboard = async () => {
  const { $client } = useNuxtApp();
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const { dashboard } = storeToRefs(dashboardStore);
  const dashboardChangedTracker = computed<Dashboard>((oldDashboardChangedTracker) => {
    // Return a new object so that save dashboard mutation doesn't re-trigger this computed
    const newDashboardChangedTracker = { ...dashboard.value };
    return oldDashboardChangedTracker && deepEqual(newDashboardChangedTracker, oldDashboardChangedTracker)
      ? oldDashboardChangedTracker
      : newDashboardChangedTracker;
  });

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

  watch(dashboardChangedTracker, saveDashboard, { deep: true });
};
