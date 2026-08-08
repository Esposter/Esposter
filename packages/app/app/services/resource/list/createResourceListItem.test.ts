import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { ResourceType } from "@esposter/db-schema";
import { describe } from "vitest";

// The row every list test pages, selects and renames. Shared so adding a column to the list shape is one edit
// Rather than one per test file — the fields a test actually asserts on are the ones it overrides.
// Spelled out in full rather than asserted, so a new required field fails to compile here instead of reaching
// A list test as a missing column.
export const createResourceListItem = (overrides: Partial<ResourceListItem> = {}): ResourceListItem => ({
  contentVersion: 0,
  createdAt: new Date(0),
  deletedAt: null,
  id: crypto.randomUUID(),
  lastAccessedAt: null,
  name: "name",
  tags: {},
  type: ResourceType.Sheet,
  updatedAt: new Date(0),
  userId: "userId",
  ...overrides,
});

describe.todo("createResourceListItem");
