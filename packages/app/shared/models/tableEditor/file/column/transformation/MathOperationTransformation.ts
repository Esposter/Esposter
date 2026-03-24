import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { MathOperationType } from "#shared/models/tableEditor/file/column/transformation/MathOperationType";
import { withSourceColumnSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumn";
import { z } from "zod";

export const mathOperationTransformationSchema = withSourceColumnSchema.extend({
  operand: z.number().optional(),
  operation: z.enum(MathOperationType),
  type: z.literal(ColumnTransformationType.MathOperation),
});

export type MathOperationTransformation = z.infer<typeof mathOperationTransformationSchema>;

export const mathOperationTransformationFormSchema = z.object({
  ...withSourceColumnSchema.shape,
  operand: mathOperationTransformationSchema.shape.operand.meta({ title: "Operand" }),
  operation: mathOperationTransformationSchema.shape.operation.meta({ title: "Operation" }),
});
