import type { SourceColumnIds } from "#shared/models/tableEditor/file/column/transformation/SourceColumnIds";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createSourceColumnIdsSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnIds";
import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/string/StringTransformationType";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface InterpolateStringTransformation
  extends ItemEntityType<ColumnTransformationType.String>, SourceColumnIds {
  pattern: string;
  stringTransformationType: typeof StringTransformationType.Interpolate;
}

export const interpolateStringTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.String).readonly()).shape,
    ...createSourceColumnIdsSchema().shape,
    pattern: z.string(),
    stringTransformationType: z.literal(StringTransformationType.Interpolate).readonly(),
  })
  .meta({
    applicableColumnTypes: [ColumnType.String],
    title: StringTransformationType.Interpolate,
  }) satisfies z.ZodType<InterpolateStringTransformation>;
