import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { Metadata } from "#shared/models/resource/sheet/datasource/Metadata";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { columnSchema } from "#shared/models/resource/sheet/column/Column";
import { metadataSchema } from "#shared/models/resource/sheet/datasource/Metadata";
import { rowSchema } from "#shared/models/resource/sheet/datasource/Row";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";
import { MAX_RESOURCE_CONTENT_LENGTH } from "#shared/services/resource/constants";

export interface DataSource {
  columns: Column[];
  metadata: Metadata;
  rows: Row[];
}

export const dataSourceSchema = z.object({
  columns: createUniqueArraySchema(columnSchema, "id").max(MAX_RESOURCE_CONTENT_LENGTH),
  metadata: metadataSchema,
  rows: createUniqueArraySchema(rowSchema, "id").max(MAX_RESOURCE_CONTENT_LENGTH),
}) satisfies z.ZodType<ToData<DataSource>>;
