import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceListItemWithFavorite } from "#shared/models/resource/ResourceListItemWithFavorite";
import type { ResourceFavoriteInResource } from "@esposter/db-schema";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { v7 } from "uuid";
import { describe } from "vitest";

// A row a resource read answers with the viewer's star beside it. The star is set unless its overrides name a removal,
// Which the server keeps as a tombstone
export const createResourceListItemWithFavorite = (
  resource: ResourceListItem = createResourceListItem(),
  overrides: Partial<ResourceFavoriteInResource> = {},
): ResourceListItemWithFavorite => ({
  ...resource,
  favorite: {
    createdAt: new Date(0),
    deletedAt: null,
    resourceId: resource.id,
    updatedAt: new Date(0),
    userId: v7(),
    version: 0,
    ...overrides,
  },
});

describe.todo("createResourceListItemWithFavorite");
