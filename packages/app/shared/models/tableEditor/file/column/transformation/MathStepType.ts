import { z } from "zod";

export enum MathStepType {
  Binary = "Binary",
  Unary = "Unary",
}

export const mathStepTypeSchema = z.enum(MathStepType) satisfies z.ZodType<MathStepType>;
