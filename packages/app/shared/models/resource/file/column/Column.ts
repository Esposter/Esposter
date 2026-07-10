import type { BooleanColumn } from "#shared/models/resource/file/column/BooleanColumn";
import type { ComputedColumn } from "#shared/models/resource/file/column/ComputedColumn";
import type { DateColumn } from "#shared/models/resource/file/column/DateColumn";
import type { NumberColumn } from "#shared/models/resource/file/column/NumberColumn";
import type { StringColumn } from "#shared/models/resource/file/column/StringColumn";
import type { ToData } from "@esposter/shared";

import { booleanColumnSchema } from "#shared/models/resource/file/column/BooleanColumn";
import { computedColumnSchema } from "#shared/models/resource/file/column/ComputedColumn";
import { dateColumnSchema } from "#shared/models/resource/file/column/DateColumn";
import { numberColumnSchema } from "#shared/models/resource/file/column/NumberColumn";
import { stringColumnSchema } from "#shared/models/resource/file/column/StringColumn";
import { z } from "zod";

export type Column = BooleanColumn | ComputedColumn | DateColumn | NumberColumn | StringColumn;

export const columnSchema = z.discriminatedUnion("type", [
  booleanColumnSchema,
  computedColumnSchema,
  dateColumnSchema,
  numberColumnSchema,
  stringColumnSchema,
]) satisfies z.ZodType<ToData<Column>>;
