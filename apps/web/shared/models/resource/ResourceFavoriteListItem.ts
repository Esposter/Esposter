import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceFavoriteInResource } from "@esposter/db-schema";

// A star the list reads, with the resource it stars. The star is the row the overlay holds, and the resource's fields are the
// Ones the read joins, which the store keeps by id beside the overlay
export interface ResourceFavoriteListItem {
  favorite: ResourceFavoriteInResource;
  resource: ResourceListItem;
}
