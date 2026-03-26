import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdsSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnIds";
import { z } from "zod";

export const stringPatternTransformationSchema = withSourceColumnIdsSchema
  .extend({
    pattern: z.string().meta({
      comp: "PatternInput",
      title: "Pattern",
    }),
    sourceColumnIds: z
      .array(
        z.string().meta({
          comp: "select",
          getItems: "context.stringSourceColumnItems",
          title: "Source Column",
        }),
      )
      .default([])
      .meta({ title: "Source Columns" }),
    type: z.literal(ColumnTransformationType.StringPattern),
  })
  .meta({ applicableColumnTypes: [ColumnType.String], title: ColumnTransformationType.StringPattern });

export type StringPatternTransformation = z.infer<typeof stringPatternTransformationSchema>;
