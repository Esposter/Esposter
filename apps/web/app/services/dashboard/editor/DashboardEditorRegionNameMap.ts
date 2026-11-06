import { DashboardEditorRegion } from "@/models/dashboard/DashboardEditorRegion";

// The name each region is announced by: its landmark's label, or a sheet's title
export const DashboardEditorRegionNameMap = {
  [DashboardEditorRegion.Bar]: "Dashboard bar",
  [DashboardEditorRegion.Inspector]: "Inspector",
  [DashboardEditorRegion.Visuals]: "Visuals",
} as const satisfies Record<string, string>;
