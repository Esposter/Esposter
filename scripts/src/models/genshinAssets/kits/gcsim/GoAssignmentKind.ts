// Whether an assignment to a name sets the value it names, with `:=` or `=`, or updates the value it reads
// Such as `+=`, `<<=` or `++`
export enum GoAssignmentKind {
  Update = "update",
  Value = "value",
}
