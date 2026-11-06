import type { HistoryCommandOptions } from "@/models/ui/HistoryCommandOptions";
import type { UiCommand } from "@/models/ui/UiCommand";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { HISTORY_REDO_SHORTCUT, HISTORY_REDO_Y_SHORTCUT, HISTORY_UNDO_SHORTCUT } from "@/services/ui/constants";

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
  {
    group,
    id: `${idPrefix}-undo`,
    meaning: UiIconMeaning.Undo,
    run: undo,
    shortcut: HISTORY_UNDO_SHORTCUT,
    title: undoTitle,
  },
  {
    group,
    id: `${idPrefix}-redo`,
    meaning: UiIconMeaning.Redo,
    run: redo,
    shortcut: HISTORY_REDO_SHORTCUT,
    title: redoTitle,
  },
  {
    group,
    id: `${idPrefix}-redo-y`,
    meaning: UiIconMeaning.Redo,
    run: redo,
    shortcut: HISTORY_REDO_Y_SHORTCUT,
    title: redoTitle,
  },
];
