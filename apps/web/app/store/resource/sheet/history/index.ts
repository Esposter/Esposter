import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";

import { MAX_HISTORY_SIZE } from "@/services/resource/sheet/constants";
import { takeOne } from "@esposter/shared";

export const useSheetHistoryStore = defineStore("resource/sheet/history", () => {
  const history = ref<ADataSourceCommand[]>([]);
  const future = ref<ADataSourceCommand[]>([]);
  const isRedoable = computed(() => future.value.length > 0);
  const isUndoable = computed(() => history.value.length > 0);
  const redoDescription = computed(() =>
    future.value.length > 0 ? takeOne(future.value, future.value.length - 1).description : "",
  );
  const undoDescription = computed(() =>
    history.value.length > 0 ? takeOne(history.value, history.value.length - 1).description : "",
  );
  const clear = () => {
    future.value = [];
    history.value = [];
  };
  const push = (command: ADataSourceCommand) => {
    // `markRaw` so Vue never wraps the command in a reactive Proxy; a Proxy breaks the
    // ECMAScript # private field/method brand checks the command relies on at execute/undo time.
    history.value.push(markRaw(command));
    if (history.value.length > MAX_HISTORY_SIZE) history.value.shift();
    future.value = [];
  };
  const redo = (dataSource: DataSource) => {
    if (!isRedoable.value) return;
    const command = takeOne(future.value, future.value.length - 1);
    future.value.pop();
    history.value.push(command);
    command.execute(dataSource);
  };
  const undo = (dataSource: DataSource) => {
    if (!isUndoable.value) return;
    const command = takeOne(history.value, history.value.length - 1);
    history.value.pop();
    future.value.push(command);
    command.undo(dataSource);
  };

  return { clear, isRedoable, isUndoable, push, redo, redoDescription, undo, undoDescription };
});
