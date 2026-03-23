import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { MoveRowCommand } from "@/models/tableEditor/file/commands/MoveRowCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

export const useReorderRows = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const fileHistoryStore = useFileHistoryStore();
  const { push } = fileHistoryStore;
  return (newRows: DataSource["rows"]) => {
    if (!editedItem.value?.dataSource) return;
    const oldRows = editedItem.value.dataSource.rows;
    const oldIndexById = new Map(oldRows.map((row, index) => [row.id, index]));
    const newRelativePositionByRowId = new Map(newRows.map((row, index) => [row.id, index]));
    // Determine the expected relative position of each row within this page subset
    const expectedRelativePositionByRowId = new Map(
      oldRows.filter((row) => newRelativePositionByRowId.has(row.id)).map((row, index) => [row.id, index]),
    );

    let movedRelativePosition = -1;
    let fromIndex = -1;
    let maxDisplacement = 0;
    for (const [oldIndex, row] of oldRows.entries()) {
      const actualRelativePosition = newRelativePositionByRowId.get(row.id);
      if (actualRelativePosition === undefined) continue;
      const expectedRelativePosition = expectedRelativePositionByRowId.get(row.id);
      if (expectedRelativePosition === undefined) continue;
      const displacement = Math.abs(actualRelativePosition - expectedRelativePosition);
      if (displacement > maxDisplacement) {
        maxDisplacement = displacement;
        fromIndex = oldIndex;
        movedRelativePosition = actualRelativePosition;
      }
    }

    if (fromIndex === -1 || movedRelativePosition === -1 || maxDisplacement === 0) return;

    let toIndex: number;
    if (movedRelativePosition === 0) {
      const nextRow = newRows.at(1);
      if (!nextRow) return;
      const nextOldIndex = oldIndexById.get(nextRow.id);
      if (nextOldIndex === undefined) return;
      toIndex = nextOldIndex;
    } else {
      const previousRow = newRows.at(movedRelativePosition - 1);
      if (!previousRow) return;
      const previousOldIndex = oldIndexById.get(previousRow.id);
      if (previousOldIndex === undefined) return;
      toIndex = previousOldIndex < fromIndex ? previousOldIndex + 1 : previousOldIndex;
    }

    if (fromIndex === toIndex) return;
    const command = new MoveRowCommand(fromIndex, toIndex);
    command.execute(editedItem.value);
    push(command);
  };
};
