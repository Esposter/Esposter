import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";
import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { columnTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import { z } from "zod";

export interface ComputedColumnForm extends AColumnForm<ColumnType.Computed> {
  transformation: ColumnTransformation;
}

export const computedColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.Computed).readonly())
  .extend({
    transformation: columnTransformationSchema,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ComputedColumnForm>;
