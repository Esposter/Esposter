import { z } from "zod";

export enum VisualType {
  Area = "Area",
  Column = "Column",
  Line = "Line",
}

export const visualTypeSchema = z.nativeEnum(VisualType) satisfies z.ZodType<VisualType>;