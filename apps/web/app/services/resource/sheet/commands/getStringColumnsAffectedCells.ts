import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getVisibleStringColumns } from "@/services/resource/sheet/column/getVisibleStringColumns";
import { collectAffectedCells } from "@/services/resource/sheet/commands/collectAffectedCells";

export const getStringColumnsAffectedCells = (dataSource: DataSource) =>
  collectAffectedCells(dataSource.rows, getVisibleStringColumns(dataSource.columns), (value) => value !== null);
