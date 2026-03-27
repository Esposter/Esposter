import { z } from "zod";

export interface Format<TFormat> {
  format?: TFormat;
}

export const createFormatSchema = <TSchema extends z.ZodType>(formatSchema: TSchema) =>
  formatSchema.optional().meta({ title: "Format" });
