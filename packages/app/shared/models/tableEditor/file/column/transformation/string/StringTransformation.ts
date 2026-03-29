import type { SourceColumnId } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import type { ItemEntityType } from "@esposter/shared";

import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { createSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/SourceColumnId";
import {
  StringTransformationType,
  stringTransformationTypeSchema,
} from "#shared/models/tableEditor/file/column/transformation/string/StringTransformationType";
import { ColumnFormVjsfContextPropertyNames } from "@/models/tableEditor/file/column/ColumnFormVjsfContext";
import { createItemEntityTypeSchema } from "@esposter/shared";
import { z } from "zod";

export interface StringTransformation extends ItemEntityType<ColumnTransformationType.String>, SourceColumnId {
  stringTransformationType: StringTransformationType;
}

export const stringTransformationSchema = z
  .object({
    ...createItemEntityTypeSchema(z.literal(ColumnTransformationType.String).readonly()).shape,
    ...createSourceColumnIdSchema(ColumnFormVjsfContextPropertyNames["context.stringColumnItems"]).shape,
    stringTransformationType: stringTransformationTypeSchema,
  })
  .meta({ title: ColumnTransformationType.String }) satisfies z.ZodType<StringTransformation>;
