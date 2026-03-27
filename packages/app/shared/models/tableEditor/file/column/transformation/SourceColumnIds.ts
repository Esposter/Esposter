import { z } from "zod";

export interface SourceColumnIds {
  sourceColumnIds: string[];
}

export const sourceColumnIdsSchema = z.object({
  sourceColumnIds: z
    .array(
      z.string().meta({
        comp: "select",
        getItems: "context.sourceColumnItems",
        title: "Source Column",
      }),
    )
    .default([])
    .meta({ title: "Source Columns" }),
});
