import type { PostWithRelations } from "@esposter/db-schema";

import { createUser } from "@/services/message/user/createUser.test";
import { describe } from "vitest";

// The post row every feed, thread and vote test works against. A comment is the same shape with a `parentId`, so
// This stands in for both. Shared so adding a column to the post shape is one edit rather than one per test file —
// The fields a test actually asserts on are the ones it overrides.
// Spelled out in full rather than asserted, so a new required field fails to compile here instead of reaching a
// Feed test as a missing column.
export const createPost = (overrides: Partial<PostWithRelations> = {}): PostWithRelations => {
  const createdAt = new Date(0);
  const user = createUser({ emailVerified: true, id: "userId" });
  return {
    ancestorIds: [],
    createdAt,
    deletedAt: null,
    depth: 0,
    description: "description",
    id: crypto.randomUUID(),
    commentCount: 0,
    likeCount: 0,
    parentId: null,
    ranking: 0,
    title: "title",
    updatedAt: createdAt,
    user,
    userId: user.id,
    ...overrides,
  };
};

describe.todo("createPost");
