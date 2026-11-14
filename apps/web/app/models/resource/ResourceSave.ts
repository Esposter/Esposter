import type { ResourceInResource } from "@esposter/db-schema";

// A save another device made of an open resource: the version it wrote and the key it was saved with. The content
// Is not carried; the store reads it through the type's own read when it adopts the save
export interface ResourceSave {
  // The key an agent saved with, named in the notice; "" for a save the person made themselves
  apiKeyName: string;
  contentVersion: ResourceInResource["contentVersion"];
}
