import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { DashboardGridTransfer } from "@/models/dashboard/DashboardGridTransfer";
import type { GridBlock } from "vue-grid-layout-headless";

// What a grid and the visuals it draws emit, shared by the grid, the group's frame and the renderer that holds them
export interface DashboardVisualEmits {
  commit: [changes: GridBlock[]];
  open: [visual: Visual];
  transfer: [transfer: DashboardGridTransfer];
}
