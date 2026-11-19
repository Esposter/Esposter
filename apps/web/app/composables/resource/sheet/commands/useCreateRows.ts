import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { CreateRowsCommand } from "#src/models/resource/sheet/commands/CreateRowsCommand";

export const useCreateRows = () =>
  useSheetCommand((dataSource, rows: ToData<Row>[], startIndex?: number) => {
    if (rows.length === 0) return undefined;
    const resolvedStartIndex = startIndex ?? dataSource.rows.length;
    return new CreateRowsCommand(resolvedStartIndex, rows);
  });
