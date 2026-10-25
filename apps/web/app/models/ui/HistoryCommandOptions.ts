import type { Promisable } from "type-fest";

export interface HistoryCommandOptions {
  group: string;
  idPrefix: string;
  redo: () => Promisable<void>;
  redoTitle: string;
  undo: () => Promisable<void>;
  undoTitle: string;
}
