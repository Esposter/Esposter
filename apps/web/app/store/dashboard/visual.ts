import type { GridCell } from "vue-grid-layout-headless";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { findVisualList } from "#shared/services/dashboard/findVisualList";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { checkIsGroupTooDeep } from "@/services/dashboard/visual/checkIsGroupTooDeep";
import { checkIsMoveRefused } from "@/services/dashboard/visual/checkIsMoveRefused";
import { createNewVisual } from "@/services/dashboard/visual/createNewVisual";
import { findVisual } from "@/services/dashboard/visual/findVisual";
import { getVisualList } from "@/services/dashboard/visual/getVisualList";
import { removeVisualFromList } from "@/services/dashboard/visual/removeVisualFromList";
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
  // A new visual goes into the list its parent group holds, or the dashboard's own list. A refusal says why, and
  // Returns nothing, so nothing is added: the dashboard is full, the parent is missing or no group, or a group would nest
  // Past the depth cap
  const getNewVisualList = (type: VisualType, parentId?: Visual["id"]) => {
    if (listVisuals(visuals.value).length >= MAX_RESOURCE_CONTENT_SIZE) {
      createAlert("The dashboard holds the most visuals it can", "error");
      return undefined;
    }
    if (parentId === undefined) return visuals.value;

    const parent = findVisual(visuals.value, { id: parentId });
    if (!parent?.visuals) {
      createAlert("The visual to hold it is not a group", "error");
      return undefined;
    }
    if (type === VisualType.Group && checkIsGroupTooDeep(visuals.value, parentId)) {
      createAlert("A group cannot nest any deeper", "error");
      return undefined;
    }
    return parent.visuals;
  };
  // A new visual of a type takes the first cell its span fits in within its list, so an added visual never moves the ones there are
  const createVisual = (type: VisualType = VisualType.Area, parentId?: Visual["id"]) => {
    const targetVisuals = getNewVisualList(type, parentId);
    if (!targetVisuals) return;

    const span = new Visual({ type });
    targetVisuals.push(createNewVisual(type, getFirstFreeCell(targetVisuals, DASHBOARD_NO_COLUMNS, span)));
  };
  // A visual the palette dropped on the grid is saved at the cell the grid placed it in
  const addVisual = (type: VisualType, cell: GridCell, parentId?: Visual["id"]) => {
    const targetVisuals = getNewVisualList(type, parentId);
    if (targetVisuals) targetVisuals.push(createNewVisual(type, cell));
  };
  const editFormData = createEditFormData(
    computed(() => listVisuals(visuals.value)),
    ["id"],
  );
  const { isEditFormDialogOpen } = editFormData;
  // The grid commits a visual's new placement by its id alone, so the placement lands on the visual wherever it sits
  const updateVisual = (visual: Partial<Visual> & Pick<Visual, "id">) => {
    const target = findVisual(visuals.value, visual);
    if (target) Object.assign(target, visual);
  };
  // One write path: apply the edit locally, persist the dashboard, revert on failure. The dialog closes only
  // On success so a rejected write keeps the user's draft open for retry instead of losing it. The rollback lands after
  // The save's await, when the blade may hold another dashboard, so it writes to the visual it found on the dashboard the edit started on
  const save = async (editedVisual: Visual) => {
    const previousVisual = findVisual(visuals.value, editedVisual);
    // A visual removed while its dialog was open has nothing to save onto, so the save is refused and the draft kept
    if (!previousVisual) {
      createAlert("The visual was removed, so the edit was not saved", "error");
      return false;
    }
    // Cloned because the edit is assigned onto the live visual. A group keeps the visuals it holds now rather than the
    // Ones its form copied when it opened, so an edit never drops a visual added since
    const snapshot = structuredClone(toRawDeep(previousVisual));
    Object.assign(previousVisual, editedVisual, { visuals: previousVisual.visuals });
    const isSuccessful = await saveDashboard();
    if (isSuccessful) isEditFormDialogOpen.value = false;
    else Object.assign(previousVisual, snapshot, { visuals: previousVisual.visuals });
    return isSuccessful;
  };
  // Fit height is a flag written on its own, so it is saved and taken back on a refusal like an edit, but opens no form
  const setAutoHeight = async (ids: { id: Visual["id"] }, isAutoHeight: boolean) => {
    const visual = findVisual(visuals.value, ids);
    if (!visual) return false;

    const previousIsAutoHeight = visual.isAutoHeight;
    Object.assign(visual, { isAutoHeight });
    const isSuccessful = await saveDashboard();
    if (!isSuccessful) Object.assign(visual, { isAutoHeight: previousIsAutoHeight });
    return isSuccessful;
  };
  // Same write path: remove locally, persist the dashboard, revert on failure so a failed delete keeps the visual. A
  // Group removes every visual it holds with it, and the removed visual itself is put back into its list
  const deleteVisual = async (ids: { id: Visual["id"] }) => {
    const dashboard = dashboardStore.dashboard;
    const list = findVisualList(dashboard.visuals, ids.id);
    const deletedVisual = findVisual(dashboard.visuals, ids);
    if (!list || !deletedVisual) return false;

    removeVisualFromList(dashboard, list.group, ids.id);
    const isSuccessful = await saveDashboard();
    if (!isSuccessful) getVisualList(dashboard, list.group).push(deletedVisual);
    return isSuccessful;
  };
  // A copy of one visual and of every visual it holds, each under a fresh id: its type, chart, binding and fit height,
  // Never a publish snapshot. The copy sits below the original at its size, saved through the same write path and taken
  // Back out if the save is refused
  const copyVisual = (visual: Visual): Visual => {
    const { chart, dataset, h, isAutoHeight, type, visuals: children, w, x, y } = visual;
    return new Visual({
      chart,
      dataset: dataset && { query: dataset.query, reference: dataset.reference },
      h,
      isAutoHeight,
      type,
      visuals: children?.map((child) => copyVisual(child)),
      w,
      x,
      y,
    });
  };
  const duplicateVisual = async (ids: { id: Visual["id"] }) => {
    const dashboard = dashboardStore.dashboard;
    const list = findVisualList(dashboard.visuals, ids.id);
    const visual = findVisual(dashboard.visuals, ids);
    if (!list || !visual) return false;

    const duplicatedVisual = copyVisual(structuredClone(toRawDeep(visual)));
    duplicatedVisual.y = visual.y + visual.h;
    getVisualList(dashboard, list.group).push(duplicatedVisual);
    const isSuccessful = await saveDashboard();
    if (!isSuccessful) removeVisualFromList(dashboard, list.group, duplicatedVisual.id);
    return isSuccessful;
  };
  // Moves a visual, with every visual it holds, into another group's list at the cell given, or into the dashboard's own
  // List when there is no target group. A move the move rule refuses changes nothing. Within one list the grid commits the
  // Move, not this
  const moveVisual = (ids: { id: Visual["id"] }, targetGroupId: undefined | Visual["id"], cell: GridCell) => {
    const dashboard = dashboardStore.dashboard;
    const source = findVisualList(dashboard.visuals, ids.id);
    const visual = findVisual(dashboard.visuals, ids);
    if (!source || !visual) return;
    if (checkIsMoveRefused(dashboard.visuals, visual.id, targetGroupId)) {
      createAlert("The visual cannot move there", "error");
      return;
    }

    const targetGroup = targetGroupId === undefined ? undefined : findVisual(dashboard.visuals, { id: targetGroupId });
    removeVisualFromList(dashboard, source.group, ids.id);
    Object.assign(visual, cell);
    getVisualList(dashboard, targetGroup).push(visual);
  };
  // The ambient operations first, so the persisting create and delete above are the ones the store hands out
  return {
    ...editFormData,
    addVisual,
    createVisual,
    deleteVisual,
    duplicateVisual,
    moveVisual,
    save,
    setAutoHeight,
    updateVisual,
    visuals,
  };
});
