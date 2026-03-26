import { BinaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/BinaryMathOperationType";
import { ColumnTransformationType } from "#shared/models/tableEditor/file/column/transformation/ColumnTransformationType";
import { MathOperandType } from "#shared/models/tableEditor/file/column/transformation/MathOperandType";
import { MathStepType } from "#shared/models/tableEditor/file/column/transformation/MathStepType";
import { UnaryMathOperationType } from "#shared/models/tableEditor/file/column/transformation/UnaryMathOperationType";
import { z } from "zod";

export const mathOperandSchema = z
  .discriminatedUnion("type", [
    z.object({
      sourceColumnId: z.string().meta({
        comp: "select",
        getItems: "context.sourceColumnItems",
        title: "Column",
      }),
      type: z.literal(MathOperandType.Column),
    }),
    z.object({
      type: z.literal(MathOperandType.Constant),
      value: z.number().meta({ title: "Value" }),
    }),
  ])
  .meta({ title: "Operand" });

export type MathOperand = z.infer<typeof mathOperandSchema>;

export const mathStepSchema = z.discriminatedUnion("type", [
  z
    .object({
      operation: z.enum(UnaryMathOperationType).meta({ title: "Operation" }),
      type: z.literal(MathStepType.Unary),
    })
    .meta({ title: MathStepType.Unary }),
  z
    .object({
      operand: mathOperandSchema,
      operation: z.enum(BinaryMathOperationType).meta({ title: "Operation" }),
      type: z.literal(MathStepType.Binary),
    })
    .meta({ title: MathStepType.Binary }),
]);

export type MathStep = z.infer<typeof mathStepSchema>;

export const mathOperationTransformationSchema = z
  .object({
    first: mathOperandSchema.meta({ title: "First" }),
    steps: z.array(mathStepSchema).default([]).meta({ title: "Steps" }),
    type: z.literal(ColumnTransformationType.MathOperation),
  })
  .meta({ title: ColumnTransformationType.MathOperation });

export type MathOperationTransformation = z.infer<typeof mathOperationTransformationSchema>;
