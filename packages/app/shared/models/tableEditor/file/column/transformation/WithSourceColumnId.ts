import { z } from "zod";

export interface WithSourceColumnId {
  sourceColumnId: string;
}

export const withSourceColumnIdSchema = z.object({
  sourceColumnId: z.string().meta({
    comp: "select",
    getItems: "context.sourceColumnItems",
    title: "Source Column",
  }),
});
