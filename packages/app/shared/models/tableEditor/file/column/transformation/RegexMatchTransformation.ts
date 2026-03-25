import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumn";
import { z } from "zod";

export const regexMatchTransformationSchema = withSourceColumnSchema
  .extend({
    groupIndex: z.number().int().nonnegative().meta({ title: "Group Index" }),
    pattern: z.string().meta({ title: "Pattern" }),
    type: z.literal(ColumnTransformationType.RegexMatch),
  })
  .meta({ title: "Regex Match" });

export type RegexMatchTransformation = z.infer<typeof regexMatchTransformationSchema>;
