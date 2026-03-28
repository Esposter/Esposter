import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { sourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import {
  StringTransformationType,
  stringTransformationTypeSchema,
} from "#shared/models/tableEditor/file/column/transformation/StringTransformationType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface StringTransformation
  extends ItemEntityType<ColumnTransformationType.StringTransformation>, SourceColumnId {
  transform: StringTransformationType;
}

export const stringTransformationSchema = z
  .object({
    ...sourceColumnIdSchema.shape,
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.StringTransformation).readonly()).shape,
    sourceColumnId: sourceColumnIdSchema.shape.sourceColumnId.meta({
      getItems: "context.stringColumnItems",
    }),
    transform: stringTransformationTypeSchema.meta({ title: "Transform" }),
  })
  .meta({
    applicableColumnTypes: [ColumnType.String],
    title: ColumnTransformationType.StringTransformation,
  }) satisfies z.ZodType<StringTransformation>;
