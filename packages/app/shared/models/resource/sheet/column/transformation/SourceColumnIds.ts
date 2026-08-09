import { ColumnFormVjsfContextPropertyNames } from "@/models/resource/sheet/column/ColumnFormVjsfContext";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

export interface SourceColumnIds {
  sourceColumnIds: string[];
}

export const sourceColumnIdsSchema = z.object({
  sourceColumnIds: createUniqueArraySchema(z.string()).meta({
    layout: { getItems: ColumnFormVjsfContextPropertyNames["context.columnItems"] },
    title: "Source Columns",
  }),
}) satisfies z.ZodType<SourceColumnIds>;
