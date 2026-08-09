import type { AColumnForm } from "#shared/models/resource/sheet/column/AColumnForm";
import type { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";

import { createAColumnFormSchema } from "#shared/models/resource/sheet/column/AColumnForm";
import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { computedColumnSchema } from "#shared/models/resource/sheet/column/ComputedColumn";
import { z } from "zod";

export interface ComputedColumnForm extends AColumnForm<ColumnType.Computed>, Pick<ComputedColumn, "transformation"> {}

export const computedColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Computed)).shape,
    transformation: computedColumnSchema.shape.transformation,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ComputedColumnForm>;
