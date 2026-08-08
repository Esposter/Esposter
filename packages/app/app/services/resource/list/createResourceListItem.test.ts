import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { ResourceType } from "@esposter/db-schema";
import { describe } from "vitest";

// The minimal row every list test pages, selects and renames. Shared so adding a column to the list shape is
// One edit rather than one per test file — the fields a test actually asserts on are the ones it overrides.
export const createResourceListItem = (overrides: Partial<ResourceListItem> = {}): ResourceListItem =>
  ({
    id: crypto.randomUUID(),
    lastAccessedAt: null,
    name: "name",
    type: ResourceType.Sheet,
    ...overrides,
  }) as ResourceListItem;

describe.todo("createResourceListItem");
