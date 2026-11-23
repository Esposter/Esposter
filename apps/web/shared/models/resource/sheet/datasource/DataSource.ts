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

// The sheet's content is held as its data shape, the plain JSON the blob carries, so its columns and rows are that
// Shape too
export interface DataSource {
  columns: ToData<Column>[];
  metadata: Metadata;
  rows: ToData<Row>[];
}

export const dataSourceSchema = z.object({
  columns: createUniqueArraySchema(columnSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE),
  metadata: metadataSchema,
  rows: createUniqueArraySchema(rowSchema, "id").max(MAX_RESOURCE_CONTENT_SIZE),
}) satisfies z.ZodType<ToData<DataSource>>;
