import { resourceListSortKeySchema } from "#shared/models/resource/ResourceListSortKey";
import { z } from "zod";

// The columns a list's sort can bind: the sort's own keys, the id that breaks every tie, and the two a search ranks by
const resourceListColumnKeySchema = z.enum([...resourceListSortKeySchema.options, "id", "nameMatch", "negRank"]);
export type ResourceListColumnKey = z.infer<typeof resourceListColumnKeySchema>;
