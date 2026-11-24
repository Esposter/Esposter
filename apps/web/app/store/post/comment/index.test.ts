// @vitest-environment nuxt
import { getMockSession } from "#server/trpc/context.test";
import { PostSortType } from "#shared/models/post/PostSortType";
import { useSession } from "#src/services/auth/authClient.test";
import { createPost } from "#src/services/post/createPost.test";
import { createRemovedPost } from "#src/services/post/createRemovedPost.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { useCommentStore } from "#src/store/post/comment/index";
import { usePostCountStore } from "#src/store/post/count";
import { usePostStore } from "#src/store/post/index";
import { takeOne, waitForSynchronizedFunctions } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

// Holds a branch's replies on the overlay, and lists them under their parent the way a page of the branch does
const seedBranch = (parentId: string, replies: ReturnType<typeof createPost>[]) => {
  const commentStore = useCommentStore();
  const { getSlice, readCommentPage } = commentStore;
  getSlice(parentId).initializeCursorPaginationData(readCommentPage({ items: replies, nextCursor: "" }));
};

describe(useCommentStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const postId = v7();
  const comment = createPost({ depth: 1, parentId: postId });
  const otherComment = createPost({ depth: 1, parentId: postId });
  const newDescription = "a";
  const failingDescription = " ";
  // A count read answers at the version after the post's own row, which is how a count the server moved is told apart
  // From the row the store already holds
  const countVersion = 1;

  // An edit is answered with whether the server kept it, and a refused one alerts and leaves the stored text as it was
  test("answers an edit with whether the server kept it", async () => {
    expect.hasAssertions();

    trpcMsw.post.updateComment.mutation(({ input }) => {
      if (input.description === failingDescription)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return createPost({ ...input, depth: 1, parentId: postId, version: 1 });
    });
    const commentStore = useCommentStore();
    const { getBranchItems, updateComment } = commentStore;
    seedBranch(postId, [comment]);
    const branchComments = getBranchItems(postId);

    await expect(updateComment({ description: newDescription, id: comment.id })).resolves.toBe(true);
    expect(takeOne(branchComments.value).description).toBe(newDescription);
    await expect(updateComment({ description: failingDescription, id: comment.id })).resolves.toBe(false);
    expect(takeOne(branchComments.value).description).toBe(newDescription);
  });

  // Two edits of one comment are written to its row in issue order, so a refused edit drops its own entry and leaves
  // The row at the edit the server kept
  test("leaves the branch on the edit the server kept when a later edit is refused", async () => {
    expect.hasAssertions();

    trpcMsw.post.updateComment.mutation(({ input }) => {
      if (input.description === failingDescription)
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return createPost({ ...input, depth: 1, parentId: postId, version: 1 });
    });
    const commentStore = useCommentStore();
    const { getBranchItems, updateComment } = commentStore;
    seedBranch(postId, [comment]);
    const branchComments = getBranchItems(postId);
    await Promise.all([
      updateComment({ description: newDescription, id: comment.id }),
      updateComment({ description: failingDescription, id: comment.id }),
    ]);

    await until(() => takeOne(branchComments.value).description).toBe(newDescription);
    expect(takeOne(branchComments.value).description).toBe(newDescription);
  });

  // A refused delete leaves its reply in the branch, and an accepted one leaves with every reply the server removed
  test("keeps a reply whose delete is refused, and drops one whose delete the server kept", async () => {
    expect.hasAssertions();

    const isRefusedDeleteReceived = Promise.withResolvers<void>();
    trpcMsw.post.deleteComment.mutation(({ input }) => {
      if (input === comment.id) {
        isRefusedDeleteReceived.resolve();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }

      return { ancestorIds: [postId], removedPosts: [createRemovedPost(otherComment)] };
    });
    // The accepted delete reads the counts it moved, and the test waits for that read so it does not end before it
    const isCountRead = Promise.withResolvers<void>();
    trpcMsw.post.readPostCounts.query(() => {
      isCountRead.resolve();
      return [{ commentCount: 0, id: postId, likeCount: 0, version: countVersion }];
    });
    const commentStore = useCommentStore();
    const { deleteComment, getBranchItems } = commentStore;
    seedBranch(postId, [comment, otherComment]);
    const branchComments = getBranchItems(postId);
    await Promise.all([deleteComment(comment.id), deleteComment(otherComment.id)]);

    await isRefusedDeleteReceived.promise;
    await until(() => branchComments.value.length).toBe(1);
    await isCountRead.promise;
    expect(takeOne(branchComments.value).id).toBe(comment.id);
  });

  // A delete cascades, so the rows beneath the one removed are gone server-side whether or not anybody had
  // Expanded them. A store that dropped the row alone would leave its replies rendering under a parent that is not
  // There
  test("drops every loaded reply beneath a deleted comment", async () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 2, parentId: comment.id });
    trpcMsw.post.deleteComment.mutation(() => ({
      ancestorIds: [postId],
      removedPosts: [createRemovedPost(comment), createRemovedPost(reply)],
    }));
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 0, id: postId, likeCount: 0, version: countVersion }]);
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { deleteComment, getBranchItems, getSlice, openPost } = commentStore;
    openPost(createPost({ commentCount: 2, id: postId }));
    seedBranch(postId, [comment]);
    seedBranch(comment.id, [reply]);
    const branchComments = getBranchItems(postId);

    await deleteComment(comment.id);

    await until(() => currentPost.value?.commentCount).toBe(0);
    expect(branchComments.value).toStrictEqual([]);
    expect(getSlice(comment.id).items.value).toStrictEqual([]);
  });

  // A removal takes the rows beneath a comment only when the server keeps it, so a rejected delete leaves the branches
  // Beneath it as they were, loaded and listing their replies
  test("leaves the branches under a rejected delete as they were", async () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 2, parentId: comment.id });
    trpcMsw.post.deleteComment.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const commentStore = useCommentStore();
    const { deleteComment, getBranchItems, getSlice, openPost } = commentStore;
    openPost(createPost({ commentCount: 2, id: postId }));
    seedBranch(postId, [comment]);
    seedBranch(comment.id, [reply]);
    const branchComments = getBranchItems(postId);
    const replyBranch = getSlice(comment.id);

    const isRemoved = await deleteComment(comment.id);

    expect(isRemoved).toBe(false);
    expect(branchComments.value).toHaveLength(1);
    expect(replyBranch.items.value).toStrictEqual([{ id: reply.id }]);
    expect(replyBranch.isLoaded.value).toBe(true);
  });

  // The counters the server moved are the ones on screen, so a reply reaches the post above its own parent as well: a
  // Root card reporting only its direct children under-reports its whole thread
  test("counts a reply against every post the server named", async () => {
    expect.hasAssertions();

    // Built here rather than at describe scope: the counters are what this asserts, and the store writes them into the
    // Rows it is handed
    const repliedToComment = createPost({ commentCount: 0, depth: 1, parentId: postId });
    const reply = createPost({ depth: 2, parentId: repliedToComment.id });
    useSession.mockReturnValue(ref({ data: { user: getMockSession().user } }));
    trpcMsw.post.createComment.mutation(({ input }) => ({
      ancestorIds: [postId, repliedToComment.id],
      comment: { ...reply, id: input.id },
    }));
    trpcMsw.post.readPostCounts.query(() => [
      { commentCount: 2, id: postId, likeCount: 0, version: countVersion },
      { commentCount: 1, id: repliedToComment.id, likeCount: 0, version: countVersion },
    ]);
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { createComment, getBranchItems, openPost } = commentStore;
    openPost(createPost({ commentCount: 1, id: postId }));
    seedBranch(postId, [repliedToComment]);
    const repliedToBranch = getBranchItems(repliedToComment.id);

    createComment({ description: "a", parentId: repliedToComment.id });

    await until(() => currentPost.value?.commentCount).toBe(2);
    await until(() => takeOne(getBranchItems(postId).value).commentCount).toBe(1);
    expect(repliedToBranch.value).toHaveLength(1);
  });

  // The feed holds the same post the thread shows, so a reply reaches the feed's copy as well
  test("counts a reply on the feed's copy of its parent post", async () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 1, parentId: postId });
    useSession.mockReturnValue(ref({ data: { user: getMockSession().user } }));
    trpcMsw.post.createComment.mutation(({ input }) => ({
      ancestorIds: [postId],
      comment: { ...reply, id: input.id },
    }));
    trpcMsw.post.readPostCounts.query(() => [{ commentCount: 1, id: postId, likeCount: 0, version: countVersion }]);
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { readItems, readPostPage } = postStore;
    await readItems(() =>
      Promise.resolve(readPostPage({ items: [createPost({ commentCount: 0, id: postId })], nextCursor: "" })),
    );

    const commentStore = useCommentStore();
    const { createComment } = commentStore;
    createComment({ description: "a", parentId: postId });
    await waitForSynchronizedFunctions();

    await until(() => takeOne(items.value).commentCount).toBe(1);
    expect(takeOne(items.value).id).toBe(postId);
  });

  // A count is held at the version it was read at, so an edit answered at an older version does not put back the count
  // A newer read already holds
  test("keeps a count a newer read holds over an edit's older answer", async () => {
    expect.hasAssertions();

    const editedComment = createPost({ commentCount: 0, depth: 1, parentId: postId });
    trpcMsw.post.updateComment.mutation(({ input }) =>
      createPost({ ...input, commentCount: 0, depth: 1, parentId: postId, version: 1 }),
    );
    const postCountStore = usePostCountStore();
    const { setPostCounts } = postCountStore;
    setPostCounts([{ commentCount: 1, id: editedComment.id, likeCount: 0, version: 2 }]);
    const commentStore = useCommentStore();
    const { getBranchItems, updateComment } = commentStore;
    seedBranch(postId, [editedComment]);
    const branchComments = getBranchItems(postId);

    await updateComment({ description: newDescription, id: editedComment.id });

    await until(() => takeOne(branchComments.value).description).toBe(newDescription);
    expect(takeOne(branchComments.value).commentCount).toBe(1);
  });

  // A new sort orders every branch afresh, so each open branch drops the rows the old order read and reads its first
  // Page again when it is shown
  test("changing the comment sort re-reads every open branch from page one", () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 2, parentId: comment.id });
    const commentStore = useCommentStore();
    const { getSlice, setCommentSortType } = commentStore;
    getSlice(postId).initializeCursorPaginationData({ items: [{ id: comment.id }], nextCursor: "cursor" });
    getSlice(comment.id).initializeCursorPaginationData({ items: [{ id: reply.id }], nextCursor: "cursor" });

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
