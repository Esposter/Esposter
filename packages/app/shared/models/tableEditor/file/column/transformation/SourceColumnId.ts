import { z } from "zod";

export interface SourceColumnId {
  sourceColumnId: string;
}

export const sourceColumnIdSchema = z.object({
  sourceColumnId: z.string().meta({
    comp: "select",
    getItems: "context.columnItems",
    title: "Source Column",
  }),
});
