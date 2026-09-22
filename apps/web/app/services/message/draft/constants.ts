// One watcher per composer rather than one over "whatever is being typed in": both are on screen at once, so
// A single source would file the thread's reply under the room's key the moment the pane has focus
export const DRAFT_DEBOUNCE_MS: number = Temporal.Duration.from({ milliseconds: 300 }).total("milliseconds");
