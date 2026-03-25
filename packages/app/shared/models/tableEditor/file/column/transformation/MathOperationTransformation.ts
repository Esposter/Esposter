import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { MathOperationType } from "#shared/models/tableEditor/file/column/transformation/MathOperationType";
import { withSourceColumnSchema } from "#shared/models/tableEditor/file/column/transformation/WithSourceColumn";
import { z } from "zod";

export const mathOperationTransformationSchema = withSourceColumnSchema
  .extend({
    operand: z.number().optional().meta({ title: "Operand" }),
    operation: z.enum(MathOperationType).meta({ title: "Operation" }),
    type: z.literal(ColumnTransformationType.MathOperation),
  })
  .meta({ title: ColumnTransformationType.MathOperation });

export type MathOperationTransformation = z.infer<typeof mathOperationTransformationSchema>;
