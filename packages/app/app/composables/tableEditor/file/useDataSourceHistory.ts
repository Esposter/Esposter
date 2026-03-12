import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";

import { MAX_HISTORY_SIZE } from "@/services/tableEditor/file/constants";
import { takeOne } from "@esposter/shared";
import { createSharedComposable } from "@vueuse/core";

export const useDataSourceHistory = createSharedComposable(() => {
  const history = ref<ADataSourceCommand[]>([]);
  const future = ref<ADataSourceCommand[]>([]);
  const isUndoable = computed(() => history.value.length > 0);
  const isRedoable = computed(() => future.value.length > 0);
  const undoDescription = computed(() =>
    history.value.length > 0 ? takeOne(history.value, history.value.length - 1).description : null,
  );
  const redoDescription = computed(() =>
    future.value.length > 0 ? takeOne(future.value, future.value.length - 1).description : null,
  );

  const push = (command: ADataSourceCommand) => {
    history.value.push(command);
    if (history.value.length > MAX_HISTORY_SIZE) history.value.shift();
    future.value = [];
  };

  const clear = () => {
    history.value = [];
    future.value = [];
  };

  const undo = (item: ADataSourceItem<DataSourceType> | undefined) => {
    if (!item || !isUndoable.value) return;
    const command = takeOne(history.value, history.value.length - 1);
    history.value.pop();
    future.value.push(command);
    command.undo(item);
  };

  const redo = (item: ADataSourceItem<DataSourceType> | undefined) => {
    if (!item || !isRedoable.value) return;
    const command = takeOne(future.value, future.value.length - 1);
    future.value.pop();
    history.value.push(command);
    command.execute(item);
  };

  return { clear, isRedoable, isUndoable, push, redo, redoDescription, undo, undoDescription };
});
