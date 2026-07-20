import type { ColumnStatistics } from "#shared/models/resource/sheet/column/ColumnStatistics";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { computeColumnStatisticsForColumn } from "@/services/resource/sheet/column/computeColumnStatisticsForColumn";

export const computeColumnStatistics = (dataSource: DataSource): ColumnStatistics[] =>
  dataSource.columns.map((column) => computeColumnStatisticsForColumn(dataSource, column));
