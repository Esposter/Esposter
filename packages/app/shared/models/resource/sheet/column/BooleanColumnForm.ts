import type { AColumnForm } from "#shared/models/resource/sheet/column/AColumnForm";
import type { BooleanColumn } from "#shared/models/resource/sheet/column/BooleanColumn";

import { createAColumnFormSchema } from "#shared/models/resource/sheet/column/AColumnForm";
import { booleanColumnSchema } from "#shared/models/resource/sheet/column/BooleanColumn";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { z } from "zod";

export interface BooleanColumnForm extends AColumnForm<ColumnType.Boolean>, Pick<BooleanColumn, "format"> {}

export const booleanColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Boolean)).shape,
    format: booleanColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Boolean }) satisfies z.ZodType<BooleanColumnForm>;
