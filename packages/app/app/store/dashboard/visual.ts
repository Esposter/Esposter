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
    deleteVisual: storeDeleteVisual,
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
  const { editFormDialog } = editFormData;
  // One write path: apply the edit locally, persist the dashboard, revert on failure. The dialog closes only
  // On success so a rejected write keeps the user's draft open for retry instead of losing it
  const save = async (editedVisual: Visual) => {
    // The unwind is this write's own visual rather than a copy of the list: a save is not instant, so a visual
    // Added or removed while this one is in flight is already on screen by the time it fails, and a list-wide
    // Restore would delete it. Cloned because updateVisual assigns onto the live visual
    const previousVisual = visuals.value.find(getEntityIdEqualComparator<Visual>(["id"], editedVisual));
    const snapshot = previousVisual ? structuredClone(toRawDeep(previousVisual)) : undefined;
    updateVisual(editedVisual);
    const isSuccessful = await saveDashboard();
    if (isSuccessful) editFormDialog.value = false;
    else if (snapshot) updateVisual(snapshot);
    return isSuccessful;
  };
  // Same write path: remove locally, persist the dashboard, revert on failure so a failed delete keeps the visual
  const deleteVisual = async (ids: { id: Visual["id"] }) => {
    // Same scoping, and the removed visual itself rather than a clone — a delete filters the list without
    // Touching it. It returns at the end, which costs it nothing: the grid places a visual by its own x/y,
    // So array order is not where it sits. Restoring the whole list instead would drop a visual the user
    // Added while the delete was in flight
    const deletedVisual = visuals.value.find(getEntityIdEqualComparator<Visual>(["id"], ids));
    storeDeleteVisual(ids);
    const isSuccessful = await saveDashboard();
    if (!isSuccessful && deletedVisual) storeCreateVisual(deletedVisual);
    return isSuccessful;
  };
  return {
    createVisual,
    deleteVisual,
    updateVisual,
    visuals,
    ...restOperationData,
    ...editFormData,
    save,
  };
});
