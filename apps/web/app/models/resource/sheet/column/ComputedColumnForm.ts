import type { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import type { BaseColumnForm } from "#src/models/resource/sheet/column/BaseColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { columnTransformationFormSchema } from "#src/models/resource/sheet/column/transformation/ColumnTransformationForm";
import { createBaseColumnFormSchema } from "#src/services/resource/sheet/column/createBaseColumnFormSchema";
import { z } from "zod";

export interface ComputedColumnForm
  extends BaseColumnForm<typeof ColumnType.Computed>, Pick<ComputedColumn, "transformation"> {}
export const computedColumnFormSchema = z
  .object({
    ...createBaseColumnFormSchema(z.literal(ColumnType.Computed)).shape,
    transformation: columnTransformationFormSchema,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ComputedColumnForm>;
