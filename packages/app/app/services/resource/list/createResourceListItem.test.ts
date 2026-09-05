import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { ResourceType } from "@esposter/db-schema";
import { describe } from "vitest";

// The resource row every test pages, selects, renames, deletes and opens a blade on. A `ResourceListItem` is a
// `Resource` plus the caller's own last-access join, so it stands in wherever a plain `Resource` is wanted
// Without a cast
export const createResourceListItem = (overrides: Partial<ResourceListItem> = {}): ResourceListItem => ({
  boundResourceId: null,
  contentVersion: 0,
  createdAt: new Date(0),
  deletedAt: null,
  id: crypto.randomUUID(),
  lastAccessedAt: null,
  name: "name",
  revisionVersion: 0,
  tags: {},
  type: ResourceType.Sheet,
  updatedAt: new Date(0),
  userId: "userId",
  ...overrides,
});

describe.todo("createResourceListItem");
