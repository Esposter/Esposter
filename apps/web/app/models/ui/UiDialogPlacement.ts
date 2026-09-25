// Where a dialog stands, from what it is for: high, so a list changing length under a field never moves the field; in
// The middle, for a decision about one thing, as a confirmation is; or down one side as a sheet, at the full height on
// A wide screen and over the whole page on a narrow one, leaving what it is about in view beside it; or over the whole
// Page at every width, for an editor the reader has asked to give the room
export enum UiDialogPlacement {
  FullScreen = "FullScreen",
  High = "High",
  Middle = "Middle",
  Sheet = "Sheet",
}
