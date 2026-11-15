// RFC 6902's six operations, each member's value the `op` the specification spells
export const JsonPatchOperationType = {
  Add: "add",
  Copy: "copy",
  Move: "move",
  Remove: "remove",
  Replace: "replace",
  Test: "test",
} as const;
export type JsonPatchOperationType = (typeof JsonPatchOperationType)[keyof typeof JsonPatchOperationType];
