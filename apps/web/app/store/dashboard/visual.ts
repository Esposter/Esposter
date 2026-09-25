import { Visual } from "#shared/models/dashboard/data/Visual";
import { DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { createOperationData } from "@/services/shared/createOperationData";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { useDashboardStore } from "@/store/dashboard";
import { toRawDeep } from "@esposter/shared";

export const useVisualStore = defineStore("dashboard/visual", () => {
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const visuals = computed({
    get: () => dashboardStore.dashboard.visuals,
    set: (newVisuals) => {
      dashboardStore.dashboard.visuals = newVisuals;
    },
  });
  const {
    createVisual: storeCreateVisual,
    updateVisual,
    ...restOperationData
  } = createOperationData(visuals, ["id"], "Visual");
  const createVisual = () => {
    storeCreateVisual(
      new Visual({
        x: (visuals.value.length * 2) % DASHBOARD_NO_COLUMNS,
        // Puts the item at the bottom
        y: visuals.value.length + DASHBOARD_NO_COLUMNS,
      }),
    );
  };
  const editFormData = createEditFormData(
    computed(() => visuals.value),
    ["id"],
  );
  const { isEditFormDialogOpen } = editFormData;
  // The writers over the one dashboard an operation was issued on. A rollback lands after the save's await, when
  // The blade may hold another dashboard — through the ambient `visuals` it would put this dashboard's visual back
  // Into that one, so the rollback writes to the document it was issued on, named where the operation starts
  const getDashboardOperationData = () =>
    createOperationData(toRef(dashboardStore.dashboard, "visuals"), ["id"], "Visual");
  // One write path: apply the edit locally, persist the dashboard, revert on failure. The dialog closes only
  // On success so a rejected write keeps the user's draft open for retry instead of losing it
  const save = async (editedVisual: Visual) => {
    const { updateVisual: updateDashboardVisual } = getDashboardOperationData();
    // Cloned because updateVisual assigns onto the live visual
    const previousVisual = visuals.value.find(getEntityIdEqualComparator<Visual>(["id"], editedVisual));
    const snapshot = previousVisual ? structuredClone(toRawDeep(previousVisual)) : undefined;
    updateDashboardVisual(editedVisual);
    const isSuccessful = await saveDashboard();
    if (isSuccessful) isEditFormDialogOpen.value = false;
    else if (snapshot) updateDashboardVisual(snapshot);
    return isSuccessful;
  };
  // Same write path: remove locally, persist the dashboard, revert on failure so a failed delete keeps the visual
  const deleteVisual = async (ids: { id: Visual["id"] }) => {
    const { createVisual: createDashboardVisual, deleteVisual: deleteDashboardVisual } = getDashboardOperationData();
    // The removed visual itself rather than a clone — a delete filters the list without touching it. It returns
    // At the end, which costs it nothing: the grid places a visual by its own x/y, not by array order
    const deletedVisual = visuals.value.find(getEntityIdEqualComparator<Visual>(["id"], ids));
    deleteDashboardVisual(ids);
    const isSuccessful = await saveDashboard();
    if (!isSuccessful && deletedVisual) createDashboardVisual(deletedVisual);
    return isSuccessful;
  };
  // The ambient operations first, so the persisting create and delete above are the ones the store hands out
  return {
    ...restOperationData,
    ...editFormData,
    createVisual,
    deleteVisual,
    save,
    updateVisual,
    visuals,
  };
});
