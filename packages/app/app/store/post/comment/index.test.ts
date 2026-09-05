// @vitest-environment nuxt
import { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import { createPost } from "@/services/post/createPost.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useCommentStore } from "@/store/post/comment";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useCommentStore, () => {
  const server = setupMswTrpc();
  const postId = crypto.randomUUID();
  const comment = createPost({ depth: 1, parentId: postId });
  const otherComment = createPost({ depth: 1, parentId: postId });
  const newDescription = "newDescription";
  const failingDescription = "failingDescription";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Two edits of one comment queue under the same key, so the second's rollback has to undo its own edit rather
  // Than restore the branch as it read at submit time — which predates the edit ahead of it
  test("rolls a failed edit back to the edit ahead of it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.post.updateComment.mutation(({ input }) => {
        if (input.description === failingDescription)
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return createPost({ ...input, depth: 1, parentId: postId });
      }),
    );
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

    server.use(
      trpcMsw.post.deleteComment.mutation(({ input }) => {
        if (input === comment.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return { ancestorIds: [postId], removedCommentCount: 1 };
      }),
    );
    const parentPost = createPost({ commentCount: 2, id: postId });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { deleteComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [comment, otherComment];
    await Promise.all([deleteComment(comment.id, postId), deleteComment(otherComment.id, postId)]);

    expect(getSlice(postId).items.value).toStrictEqual([comment]);
    expect(parentPost.commentCount).toBe(1);
  });

  // A delete cascades, so the rows beneath the one removed are gone server-side whether or not anybody had
  // Expanded them. A store that dropped the row alone leaves its replies rendering under a parent that is not
  // There, and the branch they sit in is still keyed by it
  test("drops every loaded reply beneath a deleted comment", async () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 2, parentId: comment.id });
    server.use(trpcMsw.post.deleteComment.mutation(() => ({ ancestorIds: [postId], removedCommentCount: 2 })));
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
    server.use(
      trpcMsw.post.deleteComment.mutation(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });
      }),
    );
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
    server.use(
      trpcMsw.post.createComment.mutation(() => ({ ancestorIds: [postId, repliedToComment.id], comment: reply })),
    );
    const parentPost = createPost({ commentCount: 1, id: postId });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { createComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [repliedToComment];

    await createComment({ description: newDescription, parentId: repliedToComment.id });

    expect(getSlice(repliedToComment.id).items.value).toStrictEqual([reply]);
    expect(takeOne(getSlice(postId).items.value).commentCount).toBe(1);
    expect(parentPost.commentCount).toBe(2);
  });
});
