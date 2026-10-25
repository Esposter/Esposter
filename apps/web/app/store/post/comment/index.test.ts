// @vitest-environment nuxt
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { PostSortType } from "@/models/post/PostSortType";
import { createPost } from "@/services/post/createPost.test";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { usePostStore } from "@/store/post";
import { useCommentStore } from "@/store/post/comment";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

describe(useCommentStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const postId = crypto.randomUUID();
  const comment = createPost({ depth: 1, parentId: postId });
  const otherComment = createPost({ depth: 1, parentId: postId });
  const newDescription = "a";
  const failingDescription = " ";

  // Two edits of one comment queue under the same key, so the second's rollback has to undo its own edit rather
  // Than restore the branch as it read at submit time — which predates the edit ahead of it
  test("rolls a failed edit back to the edit ahead of it", async () => {
    expect.hasAssertions();

    trpcMsw.post.updateComment.mutation(({ input }) => {
      if (input.description === failingDescription)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return createPost({ ...input, depth: 1, parentId: postId });
    });
    const commentStore = useCommentStore();
    const { getSlice, updateComment } = commentStore;
    getSlice(postId).items.value = [createPost({ depth: 1, id: comment.id, parentId: postId })];
    await Promise.all([
      updateComment({ description: newDescription, id: comment.id }, postId),
      updateComment({ description: failingDescription, id: comment.id }, postId),
    ]);

    expect(takeOne(getSlice(postId).items.value).description).toBe(newDescription);
  });

  // Deletes of different comments carry different keys, so they run beside each other
  test("rolls a failed delete back without resurrecting a comment deleted beside it", async () => {
    expect.hasAssertions();

    trpcMsw.post.deleteComment.mutation(({ input }) => {
      if (input === comment.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return { ancestorIds: [postId], removedCommentCount: 1 };
    });
    // The rollback restores the comment with the count it held when the delete was sent.
    // The count the server holds is read back over it: a count that moved while the comment was out of the thread
    // Reached no copy
    trpcMsw.post.readPostCounts.query(() => [
      { commentCount: 1, id: postId, likeCount: 0 },
      { commentCount: 0, id: comment.id, likeCount: 3 },
    ]);
    const parentPost = createPost({ commentCount: 2, id: postId });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { deleteComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [comment, otherComment];
    await Promise.all([deleteComment(comment.id, postId), deleteComment(otherComment.id, postId)]);

    expect(getSlice(postId).items.value).toStrictEqual([comment]);
    expect(takeOne(getSlice(postId).items.value).likeCount).toBe(3);
    expect(parentPost.commentCount).toBe(1);
  });

  // A delete cascades, so the rows beneath the one removed are gone server-side whether or not anybody had
  // Expanded them. A store that dropped the row alone leaves its replies rendering under a parent that is not
  // There, and the branch they sit in is still keyed by it
  test("drops every loaded reply beneath a deleted comment", async () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 2, parentId: comment.id });
    trpcMsw.post.deleteComment.mutation(() => ({ ancestorIds: [postId], removedCommentCount: 2 }));
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 0, id: postId, likeCount: 0 }]);
    const parentPost = createPost({ commentCount: 2, id: postId });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { deleteComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [comment];
    getSlice(comment.id).items.value = [reply];

    await deleteComment(comment.id, postId);

    expect(getSlice(postId).items.value).toStrictEqual([]);
    expect(getSlice(comment.id).items.value).toStrictEqual([]);
    expect(parentPost.commentCount).toBe(0);
  });

  // The rows beneath a deleted comment go optimistically, and a branch that still claims to be loaded is one a
  // Re-expansion will not read again — so a rejected delete has to leave those branches unread rather than merely
  // Empty, or the replies stay invisible while they are still there
  test("leaves the branches under a rejected delete unread", async () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 2, parentId: comment.id });
    trpcMsw.post.deleteComment.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { deleteComment, getSlice } = commentStore;
    currentPost.value = createPost({ commentCount: 2, id: postId });
    getSlice(postId).items.value = [comment];
    const replyBranch = getSlice(comment.id);
    replyBranch.initializeCursorPaginationData(new CursorPaginationData({ hasMore: false, items: [reply] }));

    await deleteComment(comment.id, postId);

    expect(getSlice(postId).items.value).toStrictEqual([comment]);
    expect(replyBranch.items.value).toStrictEqual([]);
    expect(replyBranch.isLoaded.value).toBe(false);
  });

  // The counters the server moved are the ones on screen, so a reply has to reach the post above its own parent
  // As well — a root card reporting only its direct children under-reports its whole thread
  test("counts a reply against every post the server named", async () => {
    expect.hasAssertions();

    // Built here rather than at describe scope: the counters are what this asserts, and the store writes them
    // Into the rows it is handed
    const repliedToComment = createPost({ commentCount: 0, depth: 1, parentId: postId });
    const reply = createPost({ depth: 2, parentId: repliedToComment.id });
    trpcMsw.post.createComment.mutation(() => ({ ancestorIds: [postId, repliedToComment.id], comment: reply }));
    trpcMsw.post.readPostCounts.query(() => [
      { commentCount: 2, id: postId, likeCount: 0 },
      { commentCount: 1, id: repliedToComment.id, likeCount: 0 },
    ]);
    const parentPost = createPost({ commentCount: 1, id: postId });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { createComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [repliedToComment];

    await createComment({ description: "a", parentId: repliedToComment.id });

    expect(getSlice(repliedToComment.id).items.value).toStrictEqual([reply]);
    expect(takeOne(getSlice(postId).items.value).commentCount).toBe(1);
    expect(parentPost.commentCount).toBe(2);
  });

  // The feed holds its own copy of a post the thread also shows, so a reply has to reach that copy as well
  test("counts a reply on the feed's copy of its parent post", async () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 1, parentId: postId });
    trpcMsw.post.createComment.mutation(() => ({ ancestorIds: [postId], comment: reply }));
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 1, id: postId, likeCount: 0 }]);
    const feedPost = createPost({ commentCount: 0, id: postId });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    items.value = [feedPost];

    const commentStore = useCommentStore();
    await commentStore.createComment({ description: "a", parentId: postId });

    expect(feedPost.commentCount).toBe(1);
  });

  // An edit's response can be older than a read that already landed, so the count the owner reads back is kept
  test("keeps the count the owner reads back over an edit's older response", async () => {
    expect.hasAssertions();

    const editedComment = createPost({ commentCount: 1, depth: 1, parentId: postId });
    trpcMsw.post.updateComment.mutation(({ input }) =>
      createPost({ ...input, commentCount: 0, depth: 1, parentId: postId }),
    );
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 1, id: editedComment.id, likeCount: 0 }]);
    const commentStore = useCommentStore();
    const { getSlice, updateComment } = commentStore;
    getSlice(postId).items.value = [editedComment];

    await updateComment({ description: "a", id: editedComment.id }, postId);

    expect(takeOne(getSlice(postId).items.value).commentCount).toBe(1);
  });

  // A new sort orders every branch afresh, so each open branch has to drop the rows the old order read and read its
  // First page again when it is shown
  test("changing the comment sort re-reads every open branch from page one", () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 2, parentId: comment.id });
    const commentStore = useCommentStore();
    const { getSlice, setCommentSortType } = commentStore;
    getSlice(postId).initializeCursorPaginationData(new CursorPaginationData({ hasMore: true, items: [comment] }));
    getSlice(comment.id).initializeCursorPaginationData(new CursorPaginationData({ hasMore: true, items: [reply] }));

    setCommentSortType(PostSortType.New);

    expect(getSlice(postId).items.value).toStrictEqual([]);
    expect(getSlice(postId).isLoaded.value).toBe(false);
    expect(getSlice(comment.id).items.value).toStrictEqual([]);
    expect(getSlice(comment.id).isLoaded.value).toBe(false);
  });

  // The expansion lives in the store, so the cards a re-read remounts come back open and read their replies again
  test("expanded replies stay expanded after a sort change", () => {
    expect.hasAssertions();

    const commentStore = useCommentStore();
    const { expandedCommentIds } = storeToRefs(commentStore);
    const { setCommentSortType, toggleCommentExpanded } = commentStore;
    toggleCommentExpanded(comment.id);

    setCommentSortType(PostSortType.New);

    expect(expandedCommentIds.value.has(comment.id)).toBe(true);
  });

  // The sort is a visit's own: opening another post starts it at Hot, whatever the last post was read under
  test("comment sort resets to Hot on the next post", () => {
    expect.hasAssertions();

    const commentStore = useCommentStore();
    const { commentSortType } = storeToRefs(commentStore);
    const { openPost, setCommentSortType } = commentStore;
    setCommentSortType(PostSortType.Top);

    openPost(createPost());

    expect(commentSortType.value).toBe(PostSortType.Hot);
  });
});
