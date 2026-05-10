import type { ColumnStatisticsKey } from "#shared/models/tableEditor/file/column/ColumnStatisticsKey";
import type { Format } from "#shared/models/tableEditor/file/column/Format";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { columnStatisticsKeySchema } from "#shared/models/tableEditor/file/column/ColumnStatisticsKey";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { createFormatSchema } from "#shared/models/tableEditor/file/column/Format";
import { NumberFormat, numberFormatSchema } from "#shared/models/tableEditor/file/column/NumberFormat";
import { z } from "zod";

export class NumberColumn extends AColumn<ColumnType.Number> implements Partial<Format<NumberFormat>> {
  footerStatisticsKey?: ColumnStatisticsKey;
  format?: NumberFormat;
  override readonly type = ColumnType.Number;

  constructor(init?: Partial<NumberColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const numberColumnSchema = z.object({
  ...createAColumnSchema(z.literal(ColumnType.Number)).shape,
  footerStatisticsKey: columnStatisticsKeySchema.optional(),
  format: createFormatSchema(numberFormatSchema.optional()),
}) satisfies z.ZodType<ToData<NumberColumn>>;
