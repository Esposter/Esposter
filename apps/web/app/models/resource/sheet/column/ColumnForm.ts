import type { BooleanColumnForm } from "#src/models/resource/sheet/column/BooleanColumnForm";
import type { ComputedColumnForm } from "#src/models/resource/sheet/column/ComputedColumnForm";
import type { DateColumnForm } from "#src/models/resource/sheet/column/DateColumnForm";
import type { NumberColumnForm } from "#src/models/resource/sheet/column/NumberColumnForm";
import type { StringColumnForm } from "#src/models/resource/sheet/column/StringColumnForm";

import { booleanColumnFormSchema } from "#src/models/resource/sheet/column/BooleanColumnForm";
import { computedColumnFormSchema } from "#src/models/resource/sheet/column/ComputedColumnForm";
import { dateColumnFormSchema } from "#src/models/resource/sheet/column/DateColumnForm";
import { numberColumnFormSchema } from "#src/models/resource/sheet/column/NumberColumnForm";
import { stringColumnFormSchema } from "#src/models/resource/sheet/column/StringColumnForm";
import { z } from "zod";

export type ColumnForm = BooleanColumnForm | ComputedColumnForm | DateColumnForm | NumberColumnForm | StringColumnForm;

export const columnFormSchema = z.discriminatedUnion("type", [
  booleanColumnFormSchema,
  computedColumnFormSchema,
  dateColumnFormSchema,
  numberColumnFormSchema,
  stringColumnFormSchema,
]) satisfies z.ZodType<ColumnForm>;
