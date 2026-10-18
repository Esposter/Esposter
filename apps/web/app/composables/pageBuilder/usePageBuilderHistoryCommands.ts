import type { UiCommand } from "@/models/ui/UiCommand";

import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";
import { getHistoryCommands } from "@/services/ui/getHistoryCommands";
import { usePageBuilderHistoryStore } from "@/store/pageBuilder/history";

// A command titled with the edit it acts on, or with its bare verb when there is no edit to act on
const getTitle = (verb: string, label: string) => (label ? `${verb} ${label}` : verb);

// Undo and redo for one open resource, with the sheet's shortcuts so the two editors read the same. Each command's
// Title names the edit it would act on, and the command bar follows the history as it changes
export const usePageBuilderHistoryCommands = (resourceId: MaybeRefOrGetter<string>) => {
  const pageBuilderHistoryStore = usePageBuilderHistoryStore();
  const { getRedoLabel, getUndoLabel, redo, undo } = pageBuilderHistoryStore;

  useCommands((): UiCommand[] => {
    const id = toValue(resourceId);
    const redoLabel = getRedoLabel(id);
    const undoLabel = getUndoLabel(id);
    return getHistoryCommands({
      group: PAGE_BUILDER_COMMAND_GROUP,
      idPrefix: "page-builder",
      redo: () => redo(id),
      redoTitle: getTitle("Redo", redoLabel),
      undo: () => undo(id),
      undoTitle: getTitle("Undo", undoLabel),
    });
  });
};
