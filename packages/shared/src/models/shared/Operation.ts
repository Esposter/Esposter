export const Operation = {
  Create: "Create",
  Delete: "Delete",
  Push: "Push",
  Read: "Read",
  Unshift: "Unshift",
  Update: "Update",
} as const;
export type Operation = (typeof Operation)[keyof typeof Operation];
