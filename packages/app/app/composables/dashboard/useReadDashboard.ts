import { useDashboardStore } from "@/store/dashboard";
import deepEqual from "fast-deep-equal";
import { omitDeep } from "lodash-omitdeep";

export const useReadDashboard = async () => {
  const dashboardStore = useDashboardStore();
  const { load, loadLocal, saveDashboard } = dashboardStore;
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

  await useReadData(loadLocal, load);
};
