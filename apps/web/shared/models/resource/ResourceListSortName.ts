import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { z } from "zod";

// The orders the owner's list takes: every one but the deleted-at ones, which only the Recycle bin orders by
export const resourceListSortNameSchema = z.enum(ResourceSortName).exclude(["DeletedAtAsc", "DeletedAtDesc"]);
export type ResourceListSortName = z.infer<typeof resourceListSortNameSchema>;
