import { CollisionMode } from "vue-grid-layout-headless";

// The plain words for each overlap choice. The package's names are not shown, so a reader sees what a choice does
export const DashboardEditorOverlapItems = [
  { description: "A drop moves the visuals it lands on down", title: "Push others away", value: CollisionMode.Push },
  { description: "A drop trades places with the visual it lands on", title: "Swap places", value: CollisionMode.Swap },
  { description: "A drop onto another visual is refused", title: "Block overlap", value: CollisionMode.Prevent },
];
