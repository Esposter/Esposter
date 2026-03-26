import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnIdSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumnId";
import { z } from "zod";

export const regexMatchTransformationSchema = withSourceColumnIdSchema
  .extend({
    groupIndex: z.number().int().nonnegative().meta({ title: "Group Index" }),
    pattern: z.string().meta({ title: "Pattern" }),
    type: z.literal(ColumnTransformationType.RegexMatch),
  })
  .meta({ applicableColumnTypes: [ColumnType.String], title: ColumnTransformationType.RegexMatch });

export type RegexMatchTransformation = z.infer<typeof regexMatchTransformationSchema>;
