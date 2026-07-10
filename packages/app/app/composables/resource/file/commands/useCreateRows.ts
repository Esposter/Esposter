import type { Row } from "#shared/models/resource/file/datasource/Row";

import { CreateRowsCommand } from "@/models/resource/file/commands/CreateRowsCommand";

export const useCreateRows = () =>
  useFileCommand((dataSource, rows: Row[], startIndex?: number) => {
    if (rows.length === 0) return undefined;
    const resolvedStartIndex = startIndex ?? dataSource.rows.length;
    return new CreateRowsCommand(resolvedStartIndex, rows);
  });
