import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import { ColumnFormVjsfContextPropertyNames } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface StringSplitTransformation
  extends ItemEntityType<ColumnTransformationType.StringSplit>, SourceColumnId {
  delimiter: string;
  segmentIndex: number;
}

export const stringSplitTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.StringSplit).readonly()).shape,
    ...createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.stringColumnItems"]).shape,
    delimiter: z.string().meta({ title: "Delimiter" }),
    segmentIndex: z.number().int().nonnegative().meta({ title: "Segment Index" }),
  })
  .refine((data) => data.delimiter.length > 0, { message: "Delimiter must be non-empty", path: ["delimiter"] })
  .meta({
    title: ColumnTransformationType.StringSplit,
  }) satisfies z.ZodType<StringSplitTransformation>;
