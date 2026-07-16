import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { CreateRowCommand } from "@/models/resource/sheet/commands/CreateRowCommand";

export const useCreateRow = () =>
  useSheetCommand((dataSource, newRow?: Row) => {
    const createdRow = new Row({
      data: newRow?.data ?? Object.fromEntries(dataSource.columns.map((column) => [column.name, null])),
    });
    const index = dataSource.rows.length;
    return new CreateRowCommand(index, createdRow);
  });
