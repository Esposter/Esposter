import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getVisibleStringColumns } from "@/services/resource/sheet/column/getVisibleStringColumns";
import { checkIsNullOrEmptyValue } from "@/services/resource/sheet/commands/checkIsNullOrEmptyValue";
import { collectAffectedCells } from "@/services/resource/sheet/commands/collectAffectedCells";

export const getNullAffectedCells = (dataSource: DataSource) =>
  collectAffectedCells(dataSource.rows, getVisibleStringColumns(dataSource.columns), checkIsNullOrEmptyValue);
