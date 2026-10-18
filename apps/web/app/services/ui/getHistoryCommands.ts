import type { UiCommand } from "@/models/ui/UiCommand";
import type { Promisable } from "type-fest";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface HistoryCommandOptions {
  group: string;
  idPrefix: string;
  redo: () => Promisable<void>;
  redoTitle: string;
  undo: () => Promisable<void>;
  undoTitle: string;
}

// Undo and redo for an editor's history, with the redo's Y shortcut beside its usual one so both keyboards reach it.
// Each editor names its commands by its own prefix, and titles them by what its history would act on
export const getHistoryCommands = ({
  group,
  idPrefix,
  redo,
  redoTitle,
  undo,
  undoTitle,
}: HistoryCommandOptions): UiCommand[] => [
  { group, id: `${idPrefix}-undo`, meaning: UiIconMeaning.Undo, run: undo, shortcut: "cmd+z", title: undoTitle },
  { group, id: `${idPrefix}-redo`, meaning: UiIconMeaning.Redo, run: redo, shortcut: "cmd+shift+z", title: redoTitle },
  { group, id: `${idPrefix}-redo-y`, meaning: UiIconMeaning.Redo, run: redo, shortcut: "cmd+y", title: redoTitle },
];
