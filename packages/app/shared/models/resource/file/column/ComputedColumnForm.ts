import type { AColumnForm } from "#shared/models/resource/file/column/AColumnForm";
import type { ColumnTransformation } from "#shared/models/resource/file/column/transformation/ColumnTransformation";

import { createAColumnFormSchema } from "#shared/models/resource/file/column/AColumnForm";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { columnTransformationSchema } from "#shared/models/resource/file/column/transformation/ColumnTransformation";
import { z } from "zod";

export interface ComputedColumnForm extends AColumnForm<ColumnType.Computed> {
  transformation: ColumnTransformation;
}

export const computedColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Computed).readonly()).shape,
    transformation: columnTransformationSchema,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ComputedColumnForm>;
