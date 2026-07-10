import type { Column } from "#shared/models/resource/file/column/Column";
import type { DataSourceStatistics } from "#shared/models/resource/file/datasource/DataSourceStatistics";
import type { Metadata } from "#shared/models/resource/file/datasource/Metadata";
import type { Row } from "#shared/models/resource/file/datasource/Row";
import type { ToData } from "@esposter/shared";

import { columnSchema } from "#shared/models/resource/file/column/Column";
import { dataSourceStatisticsSchema } from "#shared/models/resource/file/datasource/DataSourceStatistics";
import { metadataSchema } from "#shared/models/resource/file/datasource/Metadata";
import { rowSchema } from "#shared/models/resource/file/datasource/Row";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface DataSource {
  columns: Column[];
  metadata: Metadata;
  rows: Row[];
  statistics: DataSourceStatistics;
}

export const dataSourceSchema = z.object({
  columns: createUniqueArraySchema(columnSchema, "id"),
  metadata: metadataSchema,
  rows: createUniqueArraySchema(rowSchema, "id"),
  statistics: dataSourceStatisticsSchema,
}) satisfies z.ZodType<ToData<DataSource>>;
