import type { History } from "#src/models/History";

// The entry an undo or a redo moved, and the history after the move
export interface HistoryStep<T> {
  entry: T | undefined;
  history: History<T>;
}
