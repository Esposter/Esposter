// @vitest-environment nuxt

import { PostSortType } from "#shared/models/post/PostSortType";
import { createPost } from "#src/services/post/createPost.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useCommentStore } from "#src/store/post/comment/index";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useReadComments, () => {
  const { trpcMsw } = setupMswTrpc();
  const parentId = v7();

  test("reads each branch under the comment sort the reader chose", async () => {
    expect.hasAssertions();

    let receivedSortName: unknown;
    trpcMsw.post.readPosts.query(({ input }) => {
      receivedSortName = input?.sortName;
      return { items: [], nextCursor: "" };
    });
    const commentStore = useCommentStore();
    const { commentSortType } = storeToRefs(commentStore);
    commentSortType.value = PostSortType.Top;
    const { readComments } = useReadComments(parentId);
    await readComments();

    expect(receivedSortName).toBe(PostSortType.Top);
  });

  // A branch read issued before the sort changed belongs to the order the change replaces, so it is dropped when it
  // Lands rather than filling the branch the new order is reading into
  test("drops a branch read that lands after the sort changed", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.post.readPosts.query(async () => {
      await readGate;
      return { items: [createPost({ parentId })], nextCursor: "" };
    });
    const commentStore = useCommentStore();
    const { getSlice, setCommentSortType } = commentStore;
    const { readComments } = useReadComments(parentId);
    const pendingRead = readComments();
    setCommentSortType(PostSortType.New);
    releaseRead();
    await pendingRead;

    expect(getSlice(parentId).items.value).toStrictEqual([]);
  });
});
