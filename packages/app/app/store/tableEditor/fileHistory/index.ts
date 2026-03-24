import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";

import { MAX_HISTORY_SIZE } from "@/services/tableEditor/file/constants";
import { takeOne } from "@esposter/shared";

export const useFileHistoryStore = defineStore("tableEditor/file/history", () => {
  const history = ref<ADataSourceCommand[]>([]);
  const future = ref<ADataSourceCommand[]>([]);
  const isRedoable = computed(() => future.value.length > 0);
  const isUndoable = computed(() => history.value.length > 0);
  const redoDescription = computed(() =>
    future.value.length > 0 ? takeOne(future.value, future.value.length - 1).description : null,
  );
  const undoDescription = computed(() =>
    history.value.length > 0 ? takeOne(history.value, history.value.length - 1).description : null,
  );
  const clear = () => {
    future.value = [];
    history.value = [];
  };
  const push = (command: ADataSourceCommand) => {
    history.value.push(command);
    if (history.value.length > MAX_HISTORY_SIZE) history.value.shift();
    future.value = [];
  };
  const redo = (item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap] | undefined) => {
    if (!item || !isRedoable.value) return;
    const command = takeOne(future.value, future.value.length - 1);
    future.value.pop();
    history.value.push(command);
    command.execute(item);
  };
  const undo = (item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap] | undefined) => {
    if (!item || !isUndoable.value) return;
    const command = takeOne(history.value, history.value.length - 1);
    history.value.pop();
    future.value.push(command);
    command.undo(item);
  };

  return { clear, isRedoable, isUndoable, push, redo, redoDescription, undo, undoDescription };
});
