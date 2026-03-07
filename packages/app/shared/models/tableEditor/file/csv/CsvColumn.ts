import type { ToData } from "@esposter/shared";

import { AColumn, aColumnSchema } from "#shared/models/tableEditor/file/AColumn";
import { z } from "zod";

export class CsvColumn extends AColumn {
  constructor(init?: Partial<CsvColumn>) {
    super();
    Object.assign(this, init);
  }
}

export const csvColumnSchema = z.object({
  ...aColumnSchema.shape,
}) satisfies z.ZodType<ToData<CsvColumn>>;
