// @vitest-environment nuxt
import type { ReadPostsInput } from "#shared/models/db/post/ReadPostsInput";

import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { PostSortType } from "@/models/post/PostSortType";
import { createPost } from "@/services/post/createPost.test";
import { PostSortTypeSortByMap } from "@/services/post/PostSortTypeSortByMap";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { useCommentStore } from "@/store/post/comment";
import { describe, expect, test } from "vitest";

describe(useReadComments, () => {
  const { trpcMsw } = setupMswTrpc();
  const parentId = crypto.randomUUID();

  test("reads each branch under the comment sort the reader chose", async () => {
    expect.hasAssertions();

    let receivedInput: ReadPostsInput | undefined;
    trpcMsw.post.readPosts.query(({ input }) => {
      receivedInput = input;
      return new CursorPaginationData();
    });
    const commentStore = useCommentStore();
    const { commentSortType } = storeToRefs(commentStore);
    commentSortType.value = PostSortType.Top;
    const { readComments } = useReadComments(parentId);
    await readComments();

    expect(receivedInput?.sortBy).toStrictEqual(PostSortTypeSortByMap[PostSortType.Top]);
  });
  // A branch read issued before the sort changed belongs to the order the change replaces, so it is dropped when it
  // lands rather than filling the branch the new order is reading into
  test("drops a branch read that lands after the sort changed", async () => {
    expect.hasAssertions();

    const { promise: readGate, resolve: releaseRead } = Promise.withResolvers<void>();
    trpcMsw.post.readPosts.query(async () => {
      await readGate;
      return new CursorPaginationData({ hasMore: false, items: [createPost({ parentId })] });
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
