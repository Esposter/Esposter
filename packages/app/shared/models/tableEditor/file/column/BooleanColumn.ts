import type { AColumnForm } from "#shared/models/tableEditor/file/column/ColumnForm";
import type { ToData } from "@esposter/shared";

import { AColumn, createAColumnSchema } from "#shared/models/tableEditor/file/column/AColumn";
import { createAColumnFormSchema } from "#shared/models/tableEditor/file/column/ColumnForm";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { z } from "zod";

export class BooleanColumn extends AColumn<ColumnType.Boolean> {
  override readonly type = ColumnType.Boolean;

  constructor(init?: Partial<BooleanColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const booleanColumnSchema = createAColumnSchema(z.literal(ColumnType.Boolean)) satisfies z.ZodType<
  ToData<BooleanColumn>
>;

export const booleanColumnFormSchema = createAColumnFormSchema(z.literal(ColumnType.Boolean).readonly()).meta({
  title: ColumnType.Boolean,
}) satisfies z.ZodType<AColumnForm>;
