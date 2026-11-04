import type { GridCell } from "vue-grid-layout-headless";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";
import { createOperationData } from "@/services/shared/createOperationData";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { useAlertStore } from "@/store/alert";
import { useDashboardStore } from "@/store/dashboard";
import { toRawDeep } from "@esposter/shared";
import { getFirstFreeCell } from "vue-grid-layout-headless";

export const useVisualStore = defineStore("dashboard/visual", () => {
  const dashboardStore = useDashboardStore();
  const { saveDashboard } = dashboardStore;
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
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
  // A new visual of a type takes the first cell its span fits in, so an added visual never moves the ones there are
  const createVisual = (type: VisualType = VisualType.Area) => {
    const span = new Visual({ type });
    storeCreateVisual(new Visual({ type, ...getFirstFreeCell(visuals.value, DASHBOARD_NO_COLUMNS, span) }));
  };
  // A visual the palette dropped on the grid is saved at the cell the grid placed it in
  const addVisual = (type: VisualType, cell: GridCell) => {
    storeCreateVisual(new Visual({ type, ...cell }));
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
    const previousVisual = visuals.value.find(getEntityIdEqualComparator<Visual>(["id"], editedVisual));
    // A visual removed while its dialog was open has nothing to save onto, so the save is refused and the draft kept
    if (!previousVisual) {
      createAlert("The visual was removed, so the edit was not saved", "error");
      return false;
    }
    // Cloned because updateVisual assigns onto the live visual
    const snapshot = structuredClone(toRawDeep(previousVisual));
    updateDashboardVisual(editedVisual);
    const isSuccessful = await saveDashboard();
    if (isSuccessful) isEditFormDialogOpen.value = false;
    else updateDashboardVisual(snapshot);
    return isSuccessful;
  };
  // Fit height is a flag written on its own, so it is saved and taken back on a refusal like an edit, but opens no form
  const setAutoHeight = async (ids: { id: Visual["id"] }, isAutoHeight: boolean) => {
    const { updateVisual: updateDashboardVisual } = getDashboardOperationData();
    const visual = visuals.value.find(getEntityIdEqualComparator<Visual>(["id"], ids));
    if (!visual) return false;

    const previousIsAutoHeight = visual.isAutoHeight;
    updateDashboardVisual({ id: visual.id, isAutoHeight });
    const isSuccessful = await saveDashboard();
    if (!isSuccessful) updateDashboardVisual({ id: visual.id, isAutoHeight: previousIsAutoHeight });
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
  // A copy of one visual — its type, chart and binding, never a publish snapshot — under the original at its size,
  // Saved through the same write path and taken back out if the save is refused, as a refused delete puts its
  // Visual back
  const duplicateVisual = async (ids: { id: Visual["id"] }) => {
    const { createVisual: createDashboardVisual, deleteVisual: deleteDashboardVisual } = getDashboardOperationData();
    const visual = visuals.value.find(getEntityIdEqualComparator<Visual>(["id"], ids));
    if (!visual) return false;

    const { chart, dataset, h, type, w, x, y } = structuredClone(toRawDeep(visual));
    const duplicatedVisual = new Visual({
      chart,
      dataset: dataset && { query: dataset.query, reference: dataset.reference },
      h,
      type,
      w,
      x,
      y: y + h,
    });
    createDashboardVisual(duplicatedVisual);
    const isSuccessful = await saveDashboard();
    if (!isSuccessful) deleteDashboardVisual({ id: duplicatedVisual.id });
    return isSuccessful;
  };
  // The ambient operations first, so the persisting create and delete above are the ones the store hands out
  return {
    ...restOperationData,
    ...editFormData,
    addVisual,
    createVisual,
    deleteVisual,
    duplicateVisual,
    save,
    setAutoHeight,
    updateVisual,
    visuals,
  };
});
