import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";
import type { ColumnFormat } from "#shared/models/tableEditor/file/column/ColumnFormat";
import type { Format } from "#shared/models/tableEditor/file/column/Format";
import type { ColumnTransformation } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { computedColumnSchema } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { columnTransformationSchema } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformation";
import { z } from "zod";

export interface ComputedColumnForm extends AColumnForm<ColumnType.Computed>, Format<ColumnFormat> {
  transformation: ColumnTransformation;
}

export const computedColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Computed).readonly()).shape,
    format: computedColumnSchema.shape.format,
    transformation: columnTransformationSchema,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ComputedColumnForm>;
