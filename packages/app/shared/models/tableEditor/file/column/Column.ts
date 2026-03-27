import type { AggregationColumn } from "#shared/models/tableEditor/file/column/AggregationColumn";
import type { BooleanColumn } from "#shared/models/tableEditor/file/column/BooleanColumn";
import type { ComputedColumn } from "#shared/models/tableEditor/file/column/ComputedColumn";
import type { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import type { NumberColumn } from "#shared/models/tableEditor/file/column/NumberColumn";
import type { StringColumn } from "#shared/models/tableEditor/file/column/StringColumn";
import type { ToData } from "@esposter/shared";

import { aggregationColumnSchema } from "#shared/models/tableEditor/file/column/AggregationColumn";
import { booleanColumnSchema } from "#shared/models/tableEditor/file/column/BooleanColumn";
import { computedColumnSchema } from "#shared/models/tableEditor/file/column/ComputedColumn";
import { dateColumnSchema } from "#shared/models/tableEditor/file/column/DateColumn";
import { numberColumnSchema } from "#shared/models/tableEditor/file/column/NumberColumn";
import { stringColumnSchema } from "#shared/models/tableEditor/file/column/StringColumn";
import { z } from "zod";

export type Column = AggregationColumn | BooleanColumn | ComputedColumn | DateColumn | NumberColumn | StringColumn;

export const columnSchema = z.discriminatedUnion("type", [
  aggregationColumnSchema,
  booleanColumnSchema,
  computedColumnSchema,
  dateColumnSchema,
  numberColumnSchema,
  stringColumnSchema,
]) satisfies z.ZodType<ToData<Column>>;
