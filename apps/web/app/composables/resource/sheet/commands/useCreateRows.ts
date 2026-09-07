import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { CreateRowsCommand } from "@/models/resource/sheet/commands/CreateRowsCommand";

export const useCreateRows = () =>
  useSheetCommand((dataSource, rows: Row[], startIndex?: number) => {
    if (rows.length === 0) return undefined;
    const resolvedStartIndex = startIndex ?? dataSource.rows.length;
    return new CreateRowsCommand(resolvedStartIndex, rows);
  });
