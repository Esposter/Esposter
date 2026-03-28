import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import {
  BasicStringTransformationType,
  basicStringTransformationTypeSchema,
} from "#shared/models/tableEditor/file/column/transformation/string/BasicStringTransformationType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface BasicStringTransformation extends ItemEntityType<ColumnTransformationType.String>, SourceColumnId {
  stringTransformationType: BasicStringTransformationType;
}

export const basicStringTransformationSchema = z
  .object({
    ...sourceColumnIdSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.String).readonly()).shape,
    sourceColumnId: sourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.stringColumnItems",
    }),
    stringTransformationType: basicStringTransformationTypeSchema.meta({ title: "String Transformation" }),
  })
  .meta({ applicableColumnTypes: [ColumnType.String] }) satisfies z.ZodType<BasicStringTransformation>;
