import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DATE_FORMATS } from "#shared/models/tableEditor/file/constants";
import {
  ColumnTransformationType,
  DatePartType,
  MathOperationType,
} from "#shared/models/tableEditor/file/ColumnTransformationType";
import { z } from "zod";

const convertToTransformationSchema = z.object({
  type: z.literal(ColumnTransformationType.ConvertTo),
  targetType: z.enum([ColumnType.Boolean, ColumnType.Date, ColumnType.Number, ColumnType.String]),
  dateFormat: z.enum(DATE_FORMATS).optional(),
});

const datePartTransformationSchema = z.object({
  type: z.literal(ColumnTransformationType.DatePart),
  part: z.nativeEnum(DatePartType),
  inputFormat: z.enum(DATE_FORMATS),
});

const extractPatternTransformationSchema = z.object({
  type: z.literal(ColumnTransformationType.ExtractPattern),
  pattern: z.string(),
  groupIndex: z.number().int().nonnegative(),
});

const mathOperationTransformationSchema = z.object({
  type: z.literal(ColumnTransformationType.MathOperation),
  operation: z.nativeEnum(MathOperationType),
  operand: z.number().optional(),
});

export const columnTransformationSchema = z.discriminatedUnion("type", [
  convertToTransformationSchema,
  datePartTransformationSchema,
  extractPatternTransformationSchema,
  mathOperationTransformationSchema,
]);

export type ColumnTransformation = z.infer<typeof columnTransformationSchema>;
export type ConvertToTransformation = z.infer<typeof convertToTransformationSchema>;
export type DatePartTransformation = z.infer<typeof datePartTransformationSchema>;
export type ExtractPatternTransformation = z.infer<typeof extractPatternTransformationSchema>;
export type MathOperationTransformation = z.infer<typeof mathOperationTransformationSchema>;

// Form schemas (for Vjsf — omit the type discriminant, that's handled by a separate selector)
export const convertToTransformationFormSchema = z.object({
  targetType: convertToTransformationSchema.shape.targetType.meta({ title: "Target Type" }),
  dateFormat: convertToTransformationSchema.shape.dateFormat.meta({ title: "Date Format" }),
});

export const datePartTransformationFormSchema = z.object({
  part: datePartTransformationSchema.shape.part.meta({ title: "Part" }),
  inputFormat: datePartTransformationSchema.shape.inputFormat.meta({ title: "Input Format" }),
});

export const extractPatternTransformationFormSchema = z.object({
  pattern: extractPatternTransformationSchema.shape.pattern.meta({ title: "Pattern" }),
  groupIndex: extractPatternTransformationSchema.shape.groupIndex.meta({ title: "Group Index" }),
});

export const mathOperationTransformationFormSchema = z.object({
  operation: mathOperationTransformationSchema.shape.operation.meta({ title: "Operation" }),
  operand: mathOperationTransformationSchema.shape.operand.meta({ title: "Operand" }),
});
