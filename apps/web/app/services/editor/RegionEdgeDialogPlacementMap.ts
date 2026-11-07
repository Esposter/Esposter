import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { RegionEdge } from "vue-editor-layout-headless";

// Where a sheet stands for the edge its region sits at. A drawer slides in from its own side, as the page's drawers do. The
// Library's bottom drawer is the compact window's sheet alone (`Region.vue`), so a sheet from a top or bottom edge on a
// Wider window stands high or in the middle instead
export const RegionEdgeDialogPlacementMap = {
  [RegionEdge.Bottom]: UiDialogPlacement.Middle,
  [RegionEdge.End]: UiDialogPlacement.DrawerEnd,
  [RegionEdge.Start]: UiDialogPlacement.DrawerStart,
  [RegionEdge.Top]: UiDialogPlacement.High,
} as const satisfies Record<RegionEdge, UiDialogPlacement>;
