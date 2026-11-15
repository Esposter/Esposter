import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { Page } from "@esposter/db-schema";

// A page of the owner's resources. A table that shows how many there are gets the total with its first page, the one
// Read without a cursor to start from
export interface ResourceListPage extends Page<ResourceListItem> {
  count?: number;
}
