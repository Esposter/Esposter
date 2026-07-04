import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { CreateRowCommand } from "@/models/tableEditor/file/commands/CreateRowCommand";

export const useCreateRow = () =>
  useTableEditorCommand((editedItem, newRow?: Row) => {
    const createdRow = new Row({
      data: newRow?.data ?? Object.fromEntries(editedItem.dataSource.columns.map((column) => [column.name, null])),
    });
    const index = editedItem.dataSource.rows.length;
    return new CreateRowCommand(index, createdRow);
  });
