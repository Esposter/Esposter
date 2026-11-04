import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { GridCell } from "vue-grid-layout-headless";

// A visual released over another grid: the visual, the cell it lands in there, and the group that grid stands for, which is
// Absent for the dashboard's own grid
export interface DashboardGridTransfer {
  cell: GridCell;
  id: Visual["id"];
  targetGroupId?: Visual["id"];
}
