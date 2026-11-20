import type { ResourceFavoriteListItem } from "#shared/models/resource/ResourceFavoriteListItem";
import type { ResourceFavoriteInResource } from "@esposter/db-schema";

import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import { v7 } from "uuid";
import { describe } from "vitest";

// A star the favorites read answers: the star row the overlay holds, with the resource it stars. The star is set unless
// Its overrides name a removal, which the server keeps as a tombstone
export const createResourceFavoriteListItem = (
  resource = createResourceListItem(),
  overrides: Partial<ResourceFavoriteInResource> = {},
): ResourceFavoriteListItem => ({
  favorite: {
    createdAt: new Date(0),
    deletedAt: null,
    resourceId: resource.id,
    updatedAt: new Date(0),
    userId: v7(),
    version: 0,
    ...overrides,
  },
  resource,
});

describe.todo("createResourceFavoriteListItem");
