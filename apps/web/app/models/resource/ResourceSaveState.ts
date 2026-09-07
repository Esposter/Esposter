// Where the open resource's content stands with the server. Every type's edits land through one store action,
// So this is derived from that action rather than declared per type — an editor that autosaves on its own
// Cadence, a toolbar command and a dialog's Save all reach the same door and report the same way.
// See /docs/platform/resource-save-state
export enum ResourceSaveState {
  // The last write was rejected. Its own notification says why; this is what stays on screen after it closes
  Failed = "Failed",
  Saved = "Saved",
  // Edits are on their way — a debounce armed, a write in flight, or both
  Saving = "Saving",
  // Someone else's save moved this resource on, so nothing typed here can land until the page reloads
  Stale = "Stale",
}
