import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Metadata } from "#shared/models/resource/sheet/datasource/Metadata";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { columnSchema } from "#shared/models/resource/sheet/column/Column";
import { metadataSchema } from "#shared/models/resource/sheet/datasource/Metadata";
import { rowSchema } from "#shared/models/resource/sheet/datasource/Row";
import { MAX_RESOURCE_CONTENT_SIZE } from "#shared/services/resource/constants";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface DataSource {
  columns: Column[];
  metadata: Metadata;
  rows: Row[];
}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- ColumnType, DataSourceType (DataSourceType.ts:3) and DatasetProviderType (Metadata.ts:1) are the same declarations on both sides; the rule flags a zod object nested in an array even on an exact enum match
export const dataSourceSchema = z.object({
  columns: createUniqueArraySchema(columnSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE),
  metadata: metadataSchema,
  rows: createUniqueArraySchema(rowSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<ToData<DataSource>>;
