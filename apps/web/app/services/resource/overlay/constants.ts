import { createTable } from "#src/services/shared/overlay/createTable";
import { resourceFavoritesInResource, resourcePublicationsInResource, resourcesInResource } from "@esposter/db-schema";

// The resource rows, and each one's publication and star, held on the overlay: one slot per table
export const resourceTable = createTable(resourcesInResource);
export const publicationTable = createTable(resourcePublicationsInResource);
export const favoriteTable = createTable(resourceFavoritesInResource);
