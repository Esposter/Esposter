// The dialog edits an ordered list of rows rather than the record itself: a record cannot hold a
// Half-typed duplicate or empty name mid-edit, and rows keep their position while the user types.
export interface TagRow {
  name: string;
  value: string;
}
