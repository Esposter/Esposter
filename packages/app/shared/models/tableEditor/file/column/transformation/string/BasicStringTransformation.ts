import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import {
  BasicStringTransformationType,
  basicStringTransformationTypeSchema,
} from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";
import { ColumnFormVjsfContextPropertyNames } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface BasicStringTransformation extends ItemEntityType<ColumnTransformationType.String>, SourceColumnId {
  stringTransformationType: BasicStringTransformationType;
}

export const basicStringTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.String).readonly()).shape,
    ...createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.stringColumnItems"]).shape,
    stringTransformationType: basicStringTransformationTypeSchema,
  })
  .meta({ applicableColumnTypes: [ColumnType.String] }) satisfies z.ZodType<BasicStringTransformation>;
