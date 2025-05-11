import type { RecursiveDeepOmitItemEntity } from "#shared/util/types/RecursiveDeepOmitItemEntity";

import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { omitDeepItemEntity } from "@/services/shared/metadata/omitDeepItemEntity";
import { useDashboardStore } from "@/store/dashboard";
import deepEqual from "fast-deep-equal";

export const useReadDashboard = async () => {
  const { $trpc } = useNuxtApp();
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const { dashboard } = storeToRefs(dashboardStore);
  const virtualDashboard = computed<RecursiveDeepOmitItemEntity<Dashboard>>((oldVirtualDashboard) => {
    const newVirtualDashboard = omitDeepItemEntity(dashboard.value);
    return oldVirtualDashboard && deepEqual(newVirtualDashboard, oldVirtualDashboard)
      ? oldVirtualDashboard
      : newVirtualDashboard;
  });

  watch(virtualDashboard, async () => {
    await saveDashboard();
  });

  await useReadData(
    () => {
      const dashboardJson = localStorage.getItem(DASHBOARD_LOCAL_STORAGE_KEY);
      if (dashboardJson) dashboard.value = Object.assign(new Dashboard(), jsonDateParse(dashboardJson));
      else dashboard.value = new Dashboard();
    },
    async () => {
      dashboard.value = await $trpc.dashboard.readDashboard.query();
    },
  );
};
