import type { GridCell } from "vue-grid-layout-headless";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { checkIsGroupTooDeep } from "@/services/dashboard/visual/checkIsGroupTooDeep";
import { checkIsMoveRefused } from "@/services/dashboard/visual/checkIsMoveRefused";
import { createNewVisual } from "@/services/dashboard/visual/createNewVisual";
import { findVisual } from "@/services/dashboard/visual/findVisual";
import { findVisualLocation } from "@/services/dashboard/visual/findVisualLocation";
import { getVisualList } from "@/services/dashboard/visual/getVisualList";
import { removeVisualFromList } from "@/services/dashboard/visual/removeVisualFromList";
import { createEditFormData } from "@/services/shared/editForm/createEditFormData";
import { useAlertStore } from "@/store/alert";
import { useDashboardStore } from "@/store/dashboard";
import { getSynchronizedFunction, toRawDeep } from "@esposter/shared";
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
  // A new visual goes into the list its parent group holds, or the dashboard's own list. A refusal says why and
  // Returns nothing, so nothing is added: the parent is missing or no group, or a group would nest past the depth cap
  const getNewVisualList = (type: VisualType, parentId?: Visual["id"]) => {
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
  // A new visual of a type takes the first cell its span fits in on the dashboard, so an added visual never moves the ones there are
  const createVisual = (type: VisualType = VisualType.Area) => {
    const span = new Visual({ type });
    visuals.value.push(createNewVisual(type, getFirstFreeCell(visuals.value, DASHBOARD_NO_COLUMNS, span)));
  };
  // A visual the palette dropped on the grid is saved at the cell the grid placed it in
  const addVisual = (type: VisualType, cell: GridCell, parentId?: Visual["id"]) => {
    const targetVisuals = getNewVisualList(type, parentId);
    if (targetVisuals) targetVisuals.push(createNewVisual(type, cell));
  };
  // Counts every write to the selection, so a refused delete can tell a selection that was touched and then set back to
  // The value the delete left from one that was never touched. Counted in the setter, since a ref does not trigger on a
  // Write of the value it already holds, and a press on the empty canvas is such a write
  let selectionWriteCount = 0;
  // The visual the reader selected last, "" for nothing. Opening a visual selects it, and a press on the canvas clears it
  const selectedVisualId = customRef<Visual["id"]>((track, trigger) => {
    let value: Visual["id"] = "";
    return {
      get() {
        track();
        return value;
      },
      set(newValue) {
        selectionWriteCount++;
        value = newValue;
        trigger();
      },
    };
  });
  // The form's draft of the selected visual. Every open of a form goes through the primitive's editItem, a press, a menu's
  // Edit and a link's restore alike, so each one selects the visual it opens
  const { editedItem, editItem, resetItem } = createEditFormData(
    computed(() => listVisuals(visuals.value)),
    ["id"],
    (ids) => {
      selectedVisualId.value = ids.id;
    },
  );
  // Clearing the selection closes the form it opened and the query that restores it, so a reload does not reopen the form
  const clearSelection = () => {
    selectedVisualId.value = "";
    getSynchronizedFunction(resetItem)();
  };
  // The grid commits a visual's new placement by its id alone, so the placement lands on the visual wherever it sits
  const updateVisual = (visual: Partial<Visual> & Pick<Visual, "id">) => {
    const target = findVisual(visuals.value, visual);
    if (target) Object.assign(target, visual);
  };
  // The form's draft written onto its visual as the form changes: the type, chart and dataset the form edits, and nothing
  // Else. The place and size, fit height and a group's visuals are the grid's and the menu's, so a draft copied before one
  // Of them moved never puts it back. The dashboard's autosave persists what is written, so this is not a save of its own
  const applyEdit = (editedVisual: Visual) => {
    const targetVisual = findVisual(visuals.value, editedVisual);
    // A visual removed while its form was open has nothing to write onto, so the edit is refused and nothing changes
    if (!targetVisual) {
      createAlert("The visual was removed, so the edit was not applied", "error");
      return false;
    }

    Object.assign(targetVisual, {
      chart: structuredClone(toRawDeep(editedVisual.chart)),
      dataset: editedVisual.dataset ? structuredClone(toRawDeep(editedVisual.dataset)) : undefined,
      type: editedVisual.type,
    });
    return true;
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
    const location = findVisualLocation(dashboard.visuals, ids.id);
    if (!location) return false;

    const previousSelectedVisualId = selectedVisualId.value;
    removeVisualFromList(dashboard, location.group, ids.id);
    // The selection is cleared when it names the visual, or one a deleted group held with it
    const isSelectionCleared = Boolean(findVisual([location.visual], { id: selectedVisualId.value }));
    if (isSelectionCleared) clearSelection();
    const selectionWriteCountAfterDelete = selectionWriteCount;
    const isSuccessful = await saveDashboard();
    // A refused save also restores the selection the delete cleared, and its form with it, so the store is as it was before the
    // Delete. A selection made while the save was in flight is the reader's, so it is kept, even when it lands back on the value
    // The delete left
    if (!isSuccessful) {
      getVisualList(dashboard, location.group).push(location.visual);
      if (isSelectionCleared && selectionWriteCount === selectionWriteCountAfterDelete)
        await editItem({ id: previousSelectedVisualId });
    }
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
    const location = findVisualLocation(dashboard.visuals, ids.id);
    if (!location) return false;

    const duplicatedVisual = copyVisual(structuredClone(toRawDeep(location.visual)));
    duplicatedVisual.y = location.visual.y + location.visual.h;
    getVisualList(dashboard, location.group).push(duplicatedVisual);
    const isSuccessful = await saveDashboard();
    if (!isSuccessful) removeVisualFromList(dashboard, location.group, duplicatedVisual.id);
    return isSuccessful;
  };
  // Moves a visual, with every visual it holds, into another group's list, or into the dashboard's own list when there is
  // No target group. It lands at the cell given, or at the first free cell of the list it moves into when none is given.
  // A move the move rule refuses changes nothing. Within one list the grid commits the move, not this
  const moveVisual = (ids: { id: Visual["id"] }, targetGroupId: undefined | Visual["id"], cell?: GridCell) => {
    const dashboard = dashboardStore.dashboard;
    const location = findVisualLocation(dashboard.visuals, ids.id);
    if (!location) return;

    const { group, visual } = location;
    if (checkIsMoveRefused(dashboard.visuals, visual.id, targetGroupId)) {
      createAlert("The visual cannot move there", "error");
      return;
    }

    const targetGroup = targetGroupId === undefined ? undefined : findVisual(dashboard.visuals, { id: targetGroupId });
    removeVisualFromList(dashboard, group, ids.id);
    const targetVisuals = getVisualList(dashboard, targetGroup);
    Object.assign(visual, cell ?? getFirstFreeCell(targetVisuals, DASHBOARD_NO_COLUMNS, visual));
    targetVisuals.push(visual);
  };
  // The ambient operations first, so the persisting create and delete above are the ones the store hands out
  return {
    addVisual,
    applyEdit,
    clearSelection,
    createVisual,
    deleteVisual,
    duplicateVisual,
    editedItem,
    editItem,
    moveVisual,
    selectedVisualId,
    setAutoHeight,
    updateVisual,
    visuals,
  };
});
