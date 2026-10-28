import type { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import type { BaseColumnForm } from "@/models/resource/sheet/column/BaseColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { columnTransformationFormSchema } from "@/models/resource/sheet/column/transformation/ColumnTransformationForm";
import { createBaseColumnFormSchema } from "@/services/resource/sheet/column/createBaseColumnFormSchema";
import { z } from "zod";

export interface ComputedColumnForm
  extends BaseColumnForm<ColumnType.Computed>, Pick<ComputedColumn, "transformation"> {}

// oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- ColumnType (ColumnType.ts) and ColumnTransformationType (transformation/ColumnTransformationType.ts:1) are the same declarations on both sides; zod types each enum inside the schema as typeof, so the rule cannot see the member type the satisfies z.ZodType<ComputedColumnForm> checks
export const computedColumnFormSchema = z
  .object({
    ...createBaseColumnFormSchema(z.literal(ColumnType.Computed)).shape,
    transformation: columnTransformationFormSchema,
  })
  .meta({ title: ColumnType.Computed }) satisfies z.ZodType<ComputedColumnForm>;
