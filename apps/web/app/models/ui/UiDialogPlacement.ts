// Where a dialog stands, from what it is for: high, so a list changing length under a field never moves the field; in
// The middle, for a decision about one thing, as a confirmation is; down the edge a navigation drawer's button stands
// At, at every width; or over the whole page at every width, for content the reader has asked to give the room
export enum UiDialogPlacement {
  DrawerEnd = "DrawerEnd",
  DrawerStart = "DrawerStart",
  FullScreen = "FullScreen",
  High = "High",
  Middle = "Middle",
}
