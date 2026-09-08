import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { CreateRowCommand } from "@/models/resource/sheet/commands/CreateRowCommand";
import { createEmptyRowData } from "@/services/resource/sheet/dataSource/createEmptyRowData";

export const useCreateRow = () =>
  useSheetCommand((dataSource, newRow?: Row) => {
    const createdRow = new Row({ data: newRow?.data ?? createEmptyRowData(dataSource.columns) });
    const index = dataSource.rows.length;
    return new CreateRowCommand(index, createdRow);
  });
