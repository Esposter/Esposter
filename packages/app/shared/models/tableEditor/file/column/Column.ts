import type { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import type { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import type { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import type { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";

import { booleanColumnSchema } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { computedColumnSchema } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { dateColumnSchema } from "#shared/models/tableEditor/file/column/DateColumn";
import { numberColumnSchema } from "#shared/models/tableEditor/file/column/NumberColumn";
import { stringColumnSchema } from "#shared/models/tableEditor/file/column/StringColumn";
import { z } from "zod";

export type Column = BooleanColumn | ComputedColumn | DateColumn | NumberColumn | StringColumn;

export const columnSchema = z.discriminatedUnion("type", [
  booleanColumnSchema,
  computedColumnSchema,
  dateColumnSchema,
  numberColumnSchema,
  stringColumnSchema,
]) satisfies z.ZodType<Column>;
