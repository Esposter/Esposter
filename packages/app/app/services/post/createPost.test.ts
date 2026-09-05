import type { PostWithRelations } from "@esposter/db-schema";

import { createUser } from "@/services/message/user/createUser.test";
import { describe } from "vitest";

// The post row every feed, thread and vote test works against. A comment is the same shape with a `parentId`,
// So this stands in for both
export const createPost = (overrides: Partial<PostWithRelations> = {}): PostWithRelations => {
  const createdAt = new Date(0);
  const user = createUser({ emailVerified: true, id: "userId" });
  return {
    ancestorIds: [],
    commentCount: 0,
    createdAt,
    deletedAt: null,
    depth: 0,
    description: "description",
    id: crypto.randomUUID(),
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
