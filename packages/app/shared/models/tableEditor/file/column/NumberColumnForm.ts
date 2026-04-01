import type { AColumnForm } from "#shared/models/tableEditor/file/column/AColumnForm";
import type { ColumnStatisticsKey } from "#shared/models/tableEditor/file/column/ColumnStatisticsKey";
import type { Format } from "#shared/models/tableEditor/file/column/Format";
import type { NumberFormat } from "#shared/models/tableEditor/file/column/NumberFormat";

import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/AColumnForm";
import { columnStatisticsKeySchema } from "#shared/models/tableEditor/file/column/ColumnStatisticsKey";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { numberColumnSchema } from "#shared/models/tableEditor/file/column/NumberColumn";
import { z } from "zod";

export interface NumberColumnForm extends AColumnForm<ColumnType.Number>, Partial<Format<NumberFormat>> {
  footerStatisticsKey?: ColumnStatisticsKey;
}

export const numberColumnFormSchema = z
  .object({
    ...createAColumnFormSchema(z.literal(ColumnType.Number).readonly()).shape,
    footerStatisticsKey: columnStatisticsKeySchema.optional().meta({ title: "Footer Statistics" }),
    format: numberColumnSchema.shape.format,
  })
  .meta({ title: ColumnType.Number }) satisfies z.ZodType<NumberColumnForm>;
