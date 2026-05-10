import type { BooleanFormat } from "#shared/models/tableEditor/file/column/BooleanFormat";
import type { DateFormat } from "#shared/models/tableEditor/file/column/DateFormat";
import type { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";

import { booleanFormatSchema } from "#shared/models/tableEditor/file/column/BooleanFormat";
import { dateFormatSchema } from "#shared/models/tableEditor/file/column/DateFormat";
import { numberFormatSchema } from "#shared/models/tableEditor/file/column/NumberFormat";
import { z } from "zod";

export type ColumnFormat = BooleanFormat | DateFormat | NumberFormat;

export const columnFormatSchema = z.union([
  booleanFormatSchema,
  dateFormatSchema,
  numberFormatSchema,
]) satisfies z.ZodType<ColumnFormat>;
