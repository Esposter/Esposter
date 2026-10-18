import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";

import { MAX_HISTORY_SIZE } from "@/services/resource/sheet/constants";
import { createHistory, pushHistory, redoHistory, undoHistory } from "@esposter/shared";

export const useSheetHistoryStore = defineStore("resource/sheet/history", () => {
  // `shallowRef` so Vue never wraps a command in a reactive Proxy; a Proxy breaks the
  // ECMAScript # private field/method brand checks the command relies on at execute/undo time.
  const history = shallowRef(createHistory<ADataSourceCommand>(MAX_HISTORY_SIZE));
  const isRedoable = computed(() => history.value.future.length > 0);
  const isUndoable = computed(() => history.value.past.length > 0);
  const redoDescription = computed(() => history.value.future[0]?.description ?? "");
  const undoDescription = computed(() => history.value.past.at(-1)?.description ?? "");
  const clear = () => {
    history.value = createHistory<ADataSourceCommand>(MAX_HISTORY_SIZE);
  };
  const push = (command: ADataSourceCommand) => {
    history.value = pushHistory(history.value, command);
  };
  const redo = (dataSource: DataSource) => {
    const { entry, history: redoneHistory } = redoHistory(history.value);
    if (entry === undefined) return;
    history.value = redoneHistory;
    entry.execute(dataSource);
  };
  const undo = (dataSource: DataSource) => {
    const { entry, history: undoneHistory } = undoHistory(history.value);
    if (entry === undefined) return;
    history.value = undoneHistory;
    entry.undo(dataSource);
  };

  return { clear, isRedoable, isUndoable, push, redo, redoDescription, undo, undoDescription };
});
