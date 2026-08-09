import type { PostWithRelations } from "@esposter/db-schema";

import { StorageTier } from "@esposter/db-schema";
import { describe } from "vitest";

// The post row every feed, thread and vote test works against. A comment is the same shape with a `parentId`, so
// This stands in for both. Shared so adding a column to the post shape is one edit rather than one per test file —
// The fields a test actually asserts on are the ones it overrides.
// Spelled out in full rather than asserted, so a new required field fails to compile here instead of reaching a
// Feed test as a missing column.
export const createPost = (overrides: Partial<PostWithRelations> = {}): PostWithRelations => {
  const createdAt = new Date(0);
  const userId = "userId";
  return {
    createdAt,
    deletedAt: null,
    depth: 0,
    description: "description",
    id: crypto.randomUUID(),
    noComments: 0,
    noLikes: 0,
    parentId: null,
    ranking: 0,
    title: "title",
    updatedAt: createdAt,
    user: {
      biography: "",
      createdAt,
      deletedAt: null,
      email: "",
      emailVerified: true,
      id: userId,
      image: "",
      name: "name",
      storageBytesUsed: 0,
      storageTier: StorageTier.Free,
      updatedAt: createdAt,
    },
    userId,
    ...overrides,
  };
};

describe.todo("createPost");
