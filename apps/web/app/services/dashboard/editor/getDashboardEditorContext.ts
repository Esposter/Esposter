import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { Context } from "vue-editor-layout-headless";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DashboardSelectionKind } from "@/models/dashboard/DashboardSelectionKind";

// What the reader is doing, as the dashboard's layout reads it: nothing selected, or the one visual selected and whether that
// Visual is a group. The dashboard has no mode or tool, so both are empty
export const getDashboardEditorContext = (selectedVisual: undefined | Visual): Context => {
  if (!selectedVisual) return { mode: "", selectionCount: 0, selectionKind: "", tool: "" };

  const selectionKind =
    selectedVisual.type === VisualType.Group ? DashboardSelectionKind.Group : DashboardSelectionKind.Visual;
  return { mode: "", selectionCount: 1, selectionKind, tool: "" };
};
