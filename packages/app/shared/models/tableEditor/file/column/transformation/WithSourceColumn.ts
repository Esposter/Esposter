import { z } from "zod";

export interface WithSourceColumn {
  sourceColumnId: string;
}

export const withSourceColumnSchema = z.object({
  sourceColumnId: z.string().meta({ title: "Source Column" }),
});
