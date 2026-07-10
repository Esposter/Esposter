import type { SourceColumnId } from "#shared/models/resource/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/resource/file/column/transformation/ColumnTransformationType";
import { createSourceColumnIdSchema } from "#shared/models/resource/file/column/transformation/SourceColumnId";
import { ColumnFormVjsfContextPropertyNames } from "@/models/resource/file/column/ColumnFormVjsfContext";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface RegexMatchTransformation extends ItemEntityType<ColumnTransformationType.RegexMatch>, SourceColumnId {
  groupIndex: number;
  pattern: string;
}

export const regexMatchTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.RegexMatch).readonly()).shape,
    ...createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.stringColumnItems"]).shape,
    groupIndex: z.int().nonnegative(),
    pattern: z.string(),
  })
  .meta({ title: ColumnTransformationType.RegexMatch }) satisfies z.ZodType<RegexMatchTransformation>;
