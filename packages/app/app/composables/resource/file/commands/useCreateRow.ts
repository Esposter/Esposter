import { Row } from "#shared/models/resource/file/datasource/Row";
import { CreateRowCommand } from "@/models/resource/file/commands/CreateRowCommand";

export const useCreateRow = () =>
  useFileCommand((dataSource, newRow?: Row) => {
    const createdRow = new Row({
      data: newRow?.data ?? Object.fromEntries(dataSource.columns.map((column) => [column.name, null])),
    });
    const index = dataSource.rows.length;
    return new CreateRowCommand(index, createdRow);
  });
