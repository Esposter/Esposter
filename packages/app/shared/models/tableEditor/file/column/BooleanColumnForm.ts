import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";
import type { BooleanFormat } from "#shared/models/tableEditor/file/column/BooleanFormat";
import type { Format } from "#shared/models/tableEditor/file/column/Format";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { booleanColumnSchema } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export interface BooleanColumnForm extends AColumnForm<ColumnType.Boolean>, Format<BooleanFormat> {}

export const booleanColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Boolean).readonly()).shape,
    format: booleanColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Boolean }) satisfies z.ZodType<BooleanColumnForm>;
