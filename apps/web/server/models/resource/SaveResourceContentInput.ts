import type { ResourceActivityType, ResourceInResource } from "@esposter/db-schema";

export interface SaveResourceContentInput {
  // What the trail records for this write. Omitted where `createResourceRow` has already opened the trail with
  // The entry saying how the resource came to exist — a `ContentSaved` beside a `Duplicated` would claim the
  // Owner edited a resource they have not opened yet
  activityType?: ResourceActivityType.ContentSaved | ResourceActivityType.Restored;
  // What the blob now holds, already asset-cloned where the content came from somewhere else, since this is
  // What every reader gets back
  content: unknown;
  // The version the save was based on: bumped inside the same transaction as the blob write, and a save based on
  // A stale one is rejected. Omitted for a resource's first content write, where there is no version any client
  // Caches yet
  contentVersion?: ResourceInResource["contentVersion"];
  resource: ResourceInResource;
}
