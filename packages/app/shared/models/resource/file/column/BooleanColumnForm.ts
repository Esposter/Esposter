import type { AColumnForm } from "#shared/models/resource/file/column/AColumnForm";
import type { BooleanFormat } from "#shared/models/resource/file/column/BooleanFormat";
import type { Format } from "#shared/models/resource/file/column/Format";

import { createAColumnFormSchema } from "#shared/models/resource/file/column/AColumnForm";
import { booleanColumnSchema } from "#shared/models/resource/file/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/file/column/ColumnType";
import { z } from "zod";

export interface BooleanColumnForm extends AColumnForm<ColumnType.Boolean>, Partial<Format<BooleanFormat>> {}

export const booleanColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Boolean).readonly()).shape,
    format: booleanColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Boolean }) satisfies z.ZodType<BooleanColumnForm>;
