// Where a dialog stands, from what it is for: high, so a list changing length under a field never moves the field; in
// The middle, for a decision about one thing, as a confirmation is; down the edge a navigation drawer's button stands
// At, at every width; up from the bottom edge, for content read beside the page it is about; or over the whole page at
// Every width, for content the reader has asked to give the room
export enum UiDialogPlacement {
  DrawerBottom = "DrawerBottom",
  DrawerEnd = "DrawerEnd",
  DrawerStart = "DrawerStart",
  FullScreen = "FullScreen",
  High = "High",
  Middle = "Middle",
}
