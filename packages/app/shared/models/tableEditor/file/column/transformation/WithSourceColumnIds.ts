import { z } from "zod";

export interface WithSourceColumnIds {
  sourceColumnIds: string[];
}

export const withSourceColumnIdsSchema = z.object({
  sourceColumnIds: z.array(z.string()).meta({
    comp: "select",
    getItems: "context.sourceColumnItems",
    title: "Source Columns",
  }),
});
