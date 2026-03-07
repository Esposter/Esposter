import type { ToData } from "@esposter/shared";

import { AColumn, aColumnSchema } from "#shared/models/tableEditor/file/AColumn";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { z } from "zod";

export class XlsxColumn extends AColumn<ColumnType> {
  override type = ColumnType.String;

  constructor(init?: Partial<XlsxColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const xlsxColumnSchema = z.object({
  ...aColumnSchema.shape,
}) satisfies z.ZodType<ToData<XlsxColumn>>;
