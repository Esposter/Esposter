import { CompactType } from "vue-grid-layout-headless";

// The plain words for each packing choice. The package's names are not shown, so a reader sees what a choice does
export const DashboardEditorPackingItems = [
  { description: "Visuals rise to close gaps", title: "Pack upward", value: CompactType.Vertical },
  { description: "Visuals move left to close gaps", title: "Pack sideways", value: CompactType.Horizontal },
  { description: "Visuals stay where they are placed", title: "Free placement", value: CompactType.None },
];
