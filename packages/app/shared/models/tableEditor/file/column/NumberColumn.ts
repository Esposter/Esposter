import type { AColumnForm } from "#shared/models/tableEditor/file/column/ColumnForm";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export class NumberColumn extends AColumn<ColumnType.Number> {
  override readonly type = ColumnType.Number;

  constructor(init?: Partial<NumberColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const numberColumnSchema = createAColumnSchema(z.literal(ColumnType.Number)) satisfies z.ZodType<
  ToData<NumberColumn>
>;

export const numberColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.Number).readonly()).meta({
  title: ColumnType.Number,
}) satisfies z.ZodType<AColumnForm>;
