import type { ResourceInResource } from "@esposter/db-schema";

// Another device's save of an open resource, as the open row names it: the version it wrote. The content is not
// Carried; the store reads it through the type's own read when it adopts the save
export interface ResourceSave {
  contentVersion: ResourceInResource["contentVersion"];
}
