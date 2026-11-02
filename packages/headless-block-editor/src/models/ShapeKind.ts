import { z } from "zod";

// The outlines a shape draws: the basic shapes, then the flowchart set. An annotation takes no connection
export enum ShapeKind {
  Annotation = "annotation",
  Decision = "decision",
  Diamond = "diamond",
  Ellipse = "ellipse",
  InputOutput = "inputOutput",
  PredefinedProcess = "predefinedProcess",
  Process = "process",
  Rectangle = "rectangle",
  Terminal = "terminal",
}

export const shapeKindSchema: z.ZodEnum<typeof ShapeKind> = z.enum(ShapeKind) satisfies z.ZodType<ShapeKind>;
