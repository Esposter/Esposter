import { ResourceSortName } from "#shared/models/resource/ResourceSortName";
import { z } from "zod";

// The orders the Recycle bin's table takes: when each went, and the two columns it sorts on
export const resourceBinSortNameSchema = z
  .enum(ResourceSortName)
  .extract(["DeletedAtAsc", "DeletedAtDesc", "NameAsc", "NameDesc", "TypeAsc", "TypeDesc"]);
export type ResourceBinSortName = z.infer<typeof resourceBinSortNameSchema>;
