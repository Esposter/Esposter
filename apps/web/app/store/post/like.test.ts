// @vitest-environment nuxt
import type { LikeInPost } from "@esposter/db-schema";

import { useSession } from "#src/services/auth/authClient.test";
import { createPost } from "#src/services/post/createPost.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useCommentStore } from "#src/store/post/comment/index";
import { usePostStore } from "#src/store/post/index";
import { useLikeStore } from "#src/store/post/like";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(useLikeStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const postId = v7();
  const userId = v7();
  const like: LikeInPost = {
    createdAt: new Date(0),
    deletedAt: null,
    postId,
    updatedAt: new Date(0),
    userId,
    value: 1,
    version: 0,
  };

  // A vote is the signed-in viewer's, so every test signs the viewer in as the one the server's vote names
  beforeEach(() => {
    useSession.mockReturnValue({ value: { data: { user: { id: userId } } } });
  });

  // A vote is one row the feed, the thread and the post page all read, so a vote cast on the page reaches the feed's copy
  // Of the post as well. The post's count is read back once the vote is kept, at the version the vote moved it to
  test("lands a vote on the feed's copy and the post page's copy of one post", async () => {
    expect.hasAssertions();

    trpcMsw.like.createLike.mutation(() => like);
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 0, id: postId, likeCount: like.value, version: 1 }]);
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { readItems, readPostPage } = postStore;
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    await readItems(() => Promise.resolve(readPostPage({ items: [createPost({ id: postId })], nextCursor: "" })));
    commentStore.openPost(createPost({ id: postId }));
    const likeStore = useLikeStore();
    const { createLike } = likeStore;

    createLike({ postId, value: 1 });

    // The count is read once the vote is kept, so the count showing the vote means the vote's row has arrived too
    await until(() => takeOne(items.value).likeCount).toBe(like.value);
    expect(takeOne(items.value).viewerLike?.value).toBe(like.value);
    expect(currentPost.value?.viewerLike?.value).toBe(like.value);
    expect(currentPost.value?.likeCount).toBe(like.value);
  });

  // A vote the server refuses is taken back by its entry dropping, so the post shows no vote once the refusal lands
  test("draws no vote on a post whose vote the server refuses", async () => {
    expect.hasAssertions();

    trpcMsw.like.createLike.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { readItems, readPostPage } = postStore;
    await readItems(() => Promise.resolve(readPostPage({ items: [createPost({ id: postId })], nextCursor: "" })));
    const likeStore = useLikeStore();
    const { createLike } = likeStore;

    // The vote is drawn at once, and the refusal drops it
    createLike({ postId, value: 1 });
    expect(takeOne(items.value).viewerLike?.value).toBe(1);
    await until(() => takeOne(items.value).viewerLike).toBeUndefined();
    expect(takeOne(items.value).viewerLike).toBeUndefined();
  });

  // A removed vote is the server's tombstone, which the view leaves out, so the post reads as having no vote of the viewer
  test("draws a removed vote as no vote, at the tombstone's version", async () => {
    expect.hasAssertions();

    // The count the server holds follows the vote, so the count shows when each answer has landed
    let likeCount = 0;
    trpcMsw.like.createLike.mutation(() => {
      likeCount = like.value;
      return like;
    });
    trpcMsw.like.deleteLike.mutation(() => {
      likeCount = 0;
      return { ...like, deletedAt: new Date(0), version: 1 };
    });
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 0, id: postId, likeCount, version: 2 }]);
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { readItems, readPostPage } = postStore;
    await readItems(() => Promise.resolve(readPostPage({ items: [createPost({ id: postId })], nextCursor: "" })));
    const likeStore = useLikeStore();
    const { createLike, deleteLike } = likeStore;

    createLike({ postId, value: 1 });
    await until(() => takeOne(items.value).likeCount).toBe(like.value);
    deleteLike(postId);

    await until(() => takeOne(items.value).likeCount).toBe(0);
    expect(takeOne(items.value).viewerLike).toBeUndefined();
  });
});
