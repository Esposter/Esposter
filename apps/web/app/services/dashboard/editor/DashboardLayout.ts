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
import { RegionEdge, RegionOpening, RegionPresentation, SizeClass } from "vue-editor-layout-headless";

// The dashboard editor's layout as data. The bar holds the visual count and Add visual across the top, always. The visuals
// Palette sits at the start, closed until the reader opens it. The inspector sits at the end and shows what is selected: the
// Dashboard's settings when nothing is, and the visual's form or the group's title otherwise. The canvas is the rest of the
// Window, so the grid is the shell's default slot. A medium window is where the page's own drawers become sheets, so the
// Palette and the inspector are sheets there too, since a docked inspector would leave the grid too few columns to lay out
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
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Docked,
        [SizeClass.Expanded]: RegionPresentation.Docked,
        [SizeClass.Medium]: RegionPresentation.Docked,
      },
    },
    {
      defaultSize: DASHBOARD_EDITOR_PALETTE_WIDTH,
      edge: RegionEdge.Start,
      id: DashboardEditorRegion.Visuals,
      maximumSize: DASHBOARD_EDITOR_PALETTE_MAXIMUM_WIDTH,
      minimumSize: DASHBOARD_EDITOR_PALETTE_MINIMUM_WIDTH,
      opening: RegionOpening.OnDemand,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Sheet,
        [SizeClass.Expanded]: RegionPresentation.Docked,
        [SizeClass.Medium]: RegionPresentation.Sheet,
      },
    },
    {
      defaultSize: DASHBOARD_EDITOR_INSPECTOR_WIDTH,
      edge: RegionEdge.End,
      id: DashboardEditorRegion.Inspector,
      maximumSize: DASHBOARD_EDITOR_INSPECTOR_MAXIMUM_WIDTH,
      minimumSize: DASHBOARD_EDITOR_INSPECTOR_MINIMUM_WIDTH,
      opening: RegionOpening.WithContent,
      sizeClassEdgeMap: {},
      sizeClassPresentationMap: {
        [SizeClass.Compact]: RegionPresentation.Sheet,
        [SizeClass.Expanded]: RegionPresentation.Docked,
        [SizeClass.Medium]: RegionPresentation.Sheet,
      },
    },
  ],
};
