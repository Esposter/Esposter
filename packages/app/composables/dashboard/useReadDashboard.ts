import type { RecursiveDeepOmitItemMetadata } from "@/shared/util/types/RecursiveDeepOmitItemMetadata";

import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { omitDeepItemMetadata } from "@/services/shared/omitDeepItemMetadata";
import { Dashboard } from "@/shared/models/dashboard/data/Dashboard";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";
import { useDashboardStore } from "@/store/dashboard";
import deepEqual from "fast-deep-equal";

export const useReadDashboard = async () => {
  const { $client } = useNuxtApp();
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const { dashboard } = storeToRefs(dashboardStore);
  const dashboardChangedTracker = computed<RecursiveDeepOmitItemMetadata<Dashboard>>((oldDashboardChangedTracker) => {
    const newDashboardChangedTracker = omitDeepItemMetadata(dashboard.value);
    return oldDashboardChangedTracker && deepEqual(newDashboardChangedTracker, oldDashboardChangedTracker)
      ? oldDashboardChangedTracker
      : newDashboardChangedTracker;
  });
  await useReadData(
    () => {
      const dashboardJson = localStorage.getItem(DASHBOARD_LOCAL_STORAGE_KEY);
      if (dashboardJson) dashboard.value = Object.assign(new Dashboard(), jsonDateParse(dashboardJson));
      else dashboard.value = new Dashboard();
    },
    async () => {
      dashboard.value = await $client.dashboard.readDashboard.query();
    },
  );

  watchTracker(dashboardChangedTracker, async () => {
    await saveDashboard();
  });
};
