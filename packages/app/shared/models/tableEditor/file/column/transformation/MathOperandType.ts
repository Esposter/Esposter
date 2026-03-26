import { z } from "zod";

export enum MathOperandType {
  Column = "Column",
  Constant = "Constant",
}

export const mathOperandTypeSchema = z.enum(MathOperandType) satisfies z.ZodType<MathOperandType>;
