export enum DiffRowType {
  Added = "Added",
  Changed = "Changed",
  // A run of unchanged lines folded to its count, far enough from any change to read nothing by
  Collapsed = "Collapsed",
  Removed = "Removed",
  Unchanged = "Unchanged",
}
