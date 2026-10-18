// RFC 6902's six operations, each member's value the `op` the specification spells
export enum JsonPatchOperationType {
  Add = "add",
  Copy = "copy",
  Move = "move",
  Remove = "remove",
  Replace = "replace",
  Test = "test",
}
