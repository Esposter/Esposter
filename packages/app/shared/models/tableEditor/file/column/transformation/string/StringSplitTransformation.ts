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
    delimiter: z.string().default(","),
    segmentIndex: z.number().int().nonnegative().default(0),
  })
  .meta({
    title: ColumnTransformationType.StringSplit,
  }) satisfies z.ZodType<StringSplitTransformation>;
