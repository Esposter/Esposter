import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceFavoriteInResource } from "@esposter/db-schema";

// A row a resource read answers, with the viewer's own star beside it. Null is Drizzle's shape for the left join of a
// Row the viewer never starred, and a removed star comes back as its tombstone, so a client holds a star as set only
// While it is live
export interface ResourceListItemWithFavorite extends ResourceListItem {
  favorite: null | ResourceFavoriteInResource;
}
