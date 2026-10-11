import type { ResourceInResource } from "@esposter/db-schema";

export interface SavedResourceContentUpdate<T> {
  // The row as the save left it, at the version the update created
  resource: ResourceInResource;
  result: T;
}
