import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { withSourceColumnSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumn";
import { z } from "zod";

export const regexMatchTransformationSchema = withSourceColumnSchema.extend({
  groupIndex: z.number().int().nonnegative(),
  pattern: z.string(),
  type: z.literal(ColumnTransformationType.RegexMatch),
});

export type RegexMatchTransformation = z.infer<typeof regexMatchTransformationSchema>;

export const regexMatchTransformationFormSchema = z.object({
  ...withSourceColumnSchema.shape,
  groupIndex: regexMatchTransformationSchema.shape.groupIndex.meta({ title: "Group Index" }),
  pattern: regexMatchTransformationSchema.shape.pattern.meta({ title: "Pattern" }),
});
