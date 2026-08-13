import { z } from "zod";

export interface SourceColumnId {
  sourceColumnId: string;
}

export const sourceColumnIdSchema = z.object({
  sourceColumnId: z.string(),
}) satisfies z.ZodType<SourceColumnId>;
