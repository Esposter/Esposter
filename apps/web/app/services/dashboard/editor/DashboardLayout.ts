import type { Layout } from "vue-editor-layout-headless";

import { DashboardEditorContent } from "@/models/dashboard/DashboardEditorContent";
import { DashboardEditorRegion } from "@/models/dashboard/DashboardEditorRegion";
import { DashboardSelectionKind } from "@/models/dashboard/DashboardSelectionKind";
import {
  DASHBOARD_EDITOR_BAR_HEIGHT,
  DASHBOARD_EDITOR_INSPECTOR_MAXIMUM_WIDTH,
  DASHBOARD_EDITOR_INSPECTOR_MINIMUM_WIDTH,
  DASHBOARD_EDITOR_INSPECTOR_WIDTH,
  DASHBOARD_EDITOR_PALETTE_MAXIMUM_WIDTH,
  DASHBOARD_EDITOR_PALETTE_MINIMUM_WIDTH,
  DASHBOARD_EDITOR_PALETTE_WIDTH,
} from "@/services/dashboard/constants";
import { DOCKED_REGION_PRESENTATION_MAP, SIDE_REGION_PRESENTATION_MAP } from "@/services/editor/constants";
import { RegionEdge, RegionOpening } from "vue-editor-layout-headless";

// The dashboard editor's layout as data. The bar holds the visual count and Add visual across the top, always. The visuals
// Palette sits at the start: a column beside the grid on a wide window, open until the reader closes it, and a sheet on a
// Narrower window. The inspector sits at the end and shows what is selected: the Dashboard's settings when nothing is, and
// The visual's form or the group's title otherwise. The canvas is the rest of the Window, so the grid is the shell's default
// Slot. A medium window is where the page's own drawers become sheets, so the Palette and the inspector are sheets there too,
// Since a docked inspector would leave the grid too few columns to lay out
export const DashboardLayout: Layout = {
  canvasId: "canvas",
  panels: [
    {
      condition: {},
      id: DashboardEditorRegion.Bar,
      regionId: DashboardEditorRegion.Bar,
      selectionKindContentKeyMap: {},
      wildcardContentKey: DashboardEditorContent.Bar,
    },
    {
      condition: {},
      id: DashboardEditorRegion.Visuals,
      regionId: DashboardEditorRegion.Visuals,
      selectionKindContentKeyMap: {},
      wildcardContentKey: DashboardEditorContent.Palette,
    },
    {
      condition: {},
      id: DashboardEditorRegion.Inspector,
      regionId: DashboardEditorRegion.Inspector,
      selectionKindContentKeyMap: {
        "": DashboardEditorContent.Settings,
        [DashboardSelectionKind.Group]: DashboardEditorContent.GroupForm,
        [DashboardSelectionKind.Visual]: DashboardEditorContent.VisualForm,
      },
      wildcardContentKey: "",
    },
  ],
  regions: [
    {
      defaultSize: DASHBOARD_EDITOR_BAR_HEIGHT,
      edge: RegionEdge.Top,
      id: DashboardEditorRegion.Bar,
      maximumSize: DASHBOARD_EDITOR_BAR_HEIGHT,
      minimumSize: DASHBOARD_EDITOR_BAR_HEIGHT,
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: DOCKED_REGION_PRESENTATION_MAP,
    },
    {
      defaultSize: DASHBOARD_EDITOR_PALETTE_WIDTH,
      edge: RegionEdge.Start,
      id: DashboardEditorRegion.Visuals,
      maximumSize: DASHBOARD_EDITOR_PALETTE_MAXIMUM_WIDTH,
      minimumSize: DASHBOARD_EDITOR_PALETTE_MINIMUM_WIDTH,
      opening: RegionOpening.OnDemand,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: SIDE_REGION_PRESENTATION_MAP,
    },
    {
      defaultSize: DASHBOARD_EDITOR_INSPECTOR_WIDTH,
      edge: RegionEdge.End,
      id: DashboardEditorRegion.Inspector,
      maximumSize: DASHBOARD_EDITOR_INSPECTOR_MAXIMUM_WIDTH,
      minimumSize: DASHBOARD_EDITOR_INSPECTOR_MINIMUM_WIDTH,
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: SIDE_REGION_PRESENTATION_MAP,
    },
  ],
};
