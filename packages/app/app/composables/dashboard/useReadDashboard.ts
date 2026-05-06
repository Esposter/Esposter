import { Dashboard } from "#shared/models/dashboard/data/Dashboard";
import { DASHBOARD_LOCAL_STORAGE_KEY } from "@/services/dashboard/constants";
import { useDashboardStore } from "@/store/dashboard";
import { jsonDateParse } from "@esposter/shared";
import deepEqual from "fast-deep-equal";
import { omitDeep } from "lodash-omitdeep";

export const useReadDashboard = async () => {
  const { $trpc } = useNuxtApp();
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const { dashboard } = storeToRefs(dashboardStore);
  const virtualDashboard = computed((oldVirtualDashboard) => {
    const newVirtualDashboard = omitDeep(dashboard.value);
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
      dashboard.value = dashboardJson ? new Dashboard(jsonDateParse(dashboardJson)) : new Dashboard();
    },
    async () => {
      dashboard.value = await $trpc.dashboard.readDashboard.query();
    },
  );
};
