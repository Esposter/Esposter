import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdsSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnIds";
import { z } from "zod";

export const stringPatternTransformationSchema = withSourceColumnIdsSchema
  .extend({
    pattern: z.string().meta({
      comp: "PatternInput",
      title: "Pattern",
    }),
    type: z.literal(ColumnTransformationType.StringPattern),
  })
  .meta({ title: ColumnTransformationType.StringPattern });

export type StringPatternTransformation = z.infer<typeof stringPatternTransformationSchema>;
