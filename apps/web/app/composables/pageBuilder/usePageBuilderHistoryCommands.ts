import type { UiCommand } from "@/models/ui/UiCommand";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { PAGE_BUILDER_COMMAND_GROUP } from "@/services/pageBuilder/constants";
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
    return [
      {
        group: PAGE_BUILDER_COMMAND_GROUP,
        id: "page-builder-undo",
        meaning: UiIconMeaning.Undo,
        run: () => undo(id),
        shortcut: "cmd+z",
        title: getTitle("Undo", undoLabel),
      },
      {
        group: PAGE_BUILDER_COMMAND_GROUP,
        id: "page-builder-redo",
        meaning: UiIconMeaning.Redo,
        run: () => redo(id),
        shortcut: "cmd+shift+z",
        title: getTitle("Redo", redoLabel),
      },
      {
        group: PAGE_BUILDER_COMMAND_GROUP,
        id: "page-builder-redo-y",
        meaning: UiIconMeaning.Redo,
        run: () => redo(id),
        shortcut: "cmd+y",
        title: getTitle("Redo", redoLabel),
      },
    ];
  });
};
