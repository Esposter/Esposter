import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { ResourceType } from "@esposter/db-schema";
import { describe } from "vitest";

// The resource row every test pages, selects, renames, deletes and opens a blade on. Shared so adding a column
// To the resource shape is one edit rather than one per test file — the fields a test actually asserts on are
// The ones it overrides. A `ResourceListItem` is a `Resource` plus the caller's own last-access join, so it
// Stands in wherever a plain `Resource` is wanted without a cast.
// Spelled out in full rather than asserted, so a new required field fails to compile here instead of reaching
// A list test as a missing column.
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
