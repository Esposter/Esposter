import { z } from "zod";

export enum VisualType {
  Area = "Area",
  Bar = "Bar",
  Column = "Column",
  Line = "Line",
  RangeArea = "RangeArea",
}

export const visualTypeSchema = z.nativeEnum(VisualType) satisfies z.ZodType<VisualType>;
