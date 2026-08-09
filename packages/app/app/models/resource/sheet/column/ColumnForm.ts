import type { BooleanColumnForm } from "@/models/resource/sheet/column/BooleanColumnForm";
import type { ComputedColumnForm } from "@/models/resource/sheet/column/ComputedColumnForm";
import type { DateColumnForm } from "@/models/resource/sheet/column/DateColumnForm";
import type { NumberColumnForm } from "@/models/resource/sheet/column/NumberColumnForm";
import type { StringColumnForm } from "@/models/resource/sheet/column/StringColumnForm";

import { ColumnType } from "#shared/models/resource/sheet/column/ColumnType";
import { booleanColumnFormSchema } from "@/models/resource/sheet/column/BooleanColumnForm";
import { computedColumnFormSchema } from "@/models/resource/sheet/column/ComputedColumnForm";
import { dateColumnFormSchema } from "@/models/resource/sheet/column/DateColumnForm";
import { numberColumnFormSchema } from "@/models/resource/sheet/column/NumberColumnForm";
import { stringColumnFormSchema } from "@/models/resource/sheet/column/StringColumnForm";
import { z } from "zod";

export type ColumnForm = BooleanColumnForm | ComputedColumnForm | DateColumnForm | NumberColumnForm | StringColumnForm;

export const columnFormSchema = z.discriminatedUnion("type", [
  booleanColumnFormSchema,
  computedColumnFormSchema,
  dateColumnFormSchema,
  numberColumnFormSchema,
  stringColumnFormSchema,
]) satisfies z.ZodType<ColumnForm>;

export const ColumnTypeFormSchemaMap = {
  [ColumnType.Boolean]: booleanColumnFormSchema,
  [ColumnType.Computed]: computedColumnFormSchema,
  [ColumnType.Date]: dateColumnFormSchema,
  [ColumnType.Number]: numberColumnFormSchema,
  [ColumnType.String]: stringColumnFormSchema,
} as const satisfies Record<ColumnType, z.ZodType<ColumnForm>>;
