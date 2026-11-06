// The regions of the dashboard editor's layout that a reader can see and resize: the bar across the top, the visuals palette
// At the start and the inspector at the end. The canvas is the rest of the window, so it is not one of them
export enum DashboardEditorRegion {
  Bar = "bar",
  Inspector = "inspector",
  Visuals = "visuals",
}
