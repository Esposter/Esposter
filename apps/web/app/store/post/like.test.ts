// @vitest-environment nuxt
import type { Like } from "@esposter/db-schema";

import { createPost } from "@/services/post/createPost.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { usePostStore } from "@/store/post";
import { useCommentStore } from "@/store/post/comment";
import { useLikeStore } from "@/store/post/like";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useLikeStore, () => {
  const server = setupMswTrpc();
  const postId = crypto.randomUUID();
  const like: Like = {
    createdAt: new Date(0),
    deletedAt: null,
    postId,
    updatedAt: new Date(0),
    userId: crypto.randomUUID(),
    value: 1,
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // The post page reads its post on its own, so the feed holds a second copy of it — a vote cast on the page has to
  // Reach that one too, or going back to the feed shows the count from before the vote
  test("lands a vote on the feed's copy of a post voted on its own page", async () => {
    expect.hasAssertions();

    server.use(trpcMsw.like.createLike.mutation(() => like));
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const likeStore = useLikeStore();
    const { createLike } = likeStore;
    items.value = [createPost({ id: postId })];
    currentPost.value = createPost({ id: postId });
    await createLike({ postId, value: like.value });

    expect([items.value[0]?.likeCount, currentPost.value.likeCount]).toStrictEqual([like.value, like.value]);
  });
});
