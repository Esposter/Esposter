import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";

import { MAX_HISTORY_SIZE } from "@/composables/tableEditor/file/constants";
import { createSharedComposable } from "@vueuse/core";

export const useDataSourceHistory = createSharedComposable(() => {
  const history = ref<DataSourceCommand[]>([]);
  const future = ref<DataSourceCommand[]>([]);
  const isUndoable = computed(() => history.value.length > 0);
  const isRedoable = computed(() => future.value.length > 0);

  const push = (command: DataSourceCommand) => {
    history.value.push(command);
    if (history.value.length > MAX_HISTORY_SIZE) history.value.shift();
    future.value = [];
  };

  const clear = () => {
    history.value = [];
    future.value = [];
  };

  return { clear, future, history, isRedoable, isUndoable, push };
});
