export const Lifecycle = {
  Create: "Create",
  Init: "Init",
  NextTick: "NextTick",
  Preload: "Preload",
  Shutdown: "Shutdown",
  Update: "Update",
} as const;
export type Lifecycle = (typeof Lifecycle)[keyof typeof Lifecycle];
