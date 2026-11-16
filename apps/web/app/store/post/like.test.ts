// @vitest-environment nuxt
import type { LikeInPost } from "@esposter/db-schema";

import { createPost } from "#src/services/post/createPost.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useCommentStore } from "#src/store/post/comment/index";
import { usePostStore } from "#src/store/post/index";
import { useLikeStore } from "#src/store/post/like";
import { takeOne } from "@esposter/shared";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useLikeStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const postId = v7();
  const like: LikeInPost = {
    createdAt: new Date(0),
    deletedAt: null,
    postId,
    updatedAt: new Date(0),
    userId: v7(),
    value: 1,
  };

  // The post page reads its post on its own, so the feed holds a second copy of it — a vote cast on the page has to
  // Reach that one too, or going back to the feed shows the count from before the vote
  test("lands a vote on the feed's copy of a post voted on its own page", async () => {
    expect.hasAssertions();

    trpcMsw.like.createLike.mutation(() => like);
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 0, id: postId, likeCount: like.value }]);
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const likeStore = useLikeStore();
    const { createLike } = likeStore;
    items.value = [createPost({ id: postId })];
    const pagePost = createPost({ id: postId });
    currentPost.value = pagePost;
    createLike({ postId, value: 1 });

    // Nothing shows the vote until the server has kept it and its count is read back, so the wait is for both copies
    await until(() => takeOne(items.value).likeCount).toBe(like.value);
    await until(() => currentPost.value?.likeCount).toBe(like.value);
    expect([takeOne(items.value).likeCount, pagePost.likeCount]).toStrictEqual([like.value, like.value]);
  });
});
