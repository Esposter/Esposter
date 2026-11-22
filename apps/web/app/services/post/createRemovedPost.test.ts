import type { createPost } from "#src/services/post/createPost.test";

import { describe } from "vitest";

// The row a removal answers for a post it removed: a tombstone at the version the removal left, with its text cleared
export const createRemovedPost = (post: ReturnType<typeof createPost>) => ({
  ...post,
  deletedAt: new Date(0),
  description: "",
  title: "",
  version: post.version + 1,
});

describe.todo("createRemovedPost");
