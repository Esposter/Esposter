import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getVisibleStringColumns } from "#src/services/resource/sheet/column/getVisibleStringColumns";
import { checkIsNullOrEmptyValue } from "#src/services/resource/sheet/commands/checkIsNullOrEmptyValue";
import { collectAffectedCells } from "#src/services/resource/sheet/commands/collectAffectedCells";

export const getNullAffectedCells = (dataSource: DataSource) =>
  collectAffectedCells(dataSource.rows, getVisibleStringColumns(dataSource.columns), checkIsNullOrEmptyValue);
