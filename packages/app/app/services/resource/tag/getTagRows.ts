import type { TagRow } from "@/models/resource/TagRow";
import type { ResourceTags } from "@esposter/db-schema";

export const getTagRows = (tags: ResourceTags): TagRow[] =>
  Object.entries(tags).map(([name, value]) => ({ name, value }));
