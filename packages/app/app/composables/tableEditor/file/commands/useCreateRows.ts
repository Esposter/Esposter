import type { Row } from "#shared/models/tableEditor/file/datasource/Row";

import { CreateRowsCommand } from "@/models/tableEditor/file/commands/CreateRowsCommand";

export const useCreateRows = () =>
  useTableEditorCommand((editedItem, rows: Row[], startIndex?: number) => {
    if (rows.length === 0) return undefined;
    const resolvedStartIndex = startIndex ?? editedItem.dataSource.rows.length;
    return new CreateRowsCommand(resolvedStartIndex, rows);
  });
