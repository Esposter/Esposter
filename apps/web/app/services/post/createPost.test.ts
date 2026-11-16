import type { PostInPostWithRelations } from "@esposter/db-schema";
import type { UndefinedOnPartial } from "type-fest";

import { createUser } from "#src/services/message/user/createUser.test";
import { omitUndefined } from "@esposter/shared";
import { v7 } from "uuid";
import { describe } from "vitest";

// The post row every feed, thread and vote test works against. A comment is the same shape with a `parentId`,
// So this stands in for both
export const createPost = (
  overrides: UndefinedOnPartial<Partial<PostInPostWithRelations>> = {},
): PostInPostWithRelations => {
  const createdAt = new Date(0);
  const user = createUser();
  return {
    ancestorIds: [],
    commentCount: 0,
    createdAt,
    deletedAt: null,
    depth: 0,
    description: "description",
    id: v7(),
    likeCount: 0,
    parentId: null,
    ranking: 0,
    title: "title",
    updatedAt: createdAt,
    user,
    userId: user.id,
    ...omitUndefined(overrides),
  };
};

describe.todo("createPost");
