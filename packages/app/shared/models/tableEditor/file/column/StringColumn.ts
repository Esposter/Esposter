import type { AColumnForm } from "#shared/models/tableEditor/file/column/ColumnForm";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export class StringColumn extends AColumn<ColumnType.String> {
  override readonly type = ColumnType.String;

  constructor(init?: Partial<StringColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const stringColumnSchema = createAColumnSchema(z.literal(ColumnType.String)) satisfies z.ZodType<
  ToData<StringColumn>
>;

export const stringColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.String).readonly()).meta({
  title: ColumnType.String,
}) satisfies z.ZodType<AColumnForm>;
