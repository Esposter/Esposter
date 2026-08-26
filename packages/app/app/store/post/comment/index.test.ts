// @vitest-environment nuxt
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

  // Deletes of different comments carry different keys, so they run beside each other — restoring a copy of the
  // Branch resurrects the comment the delete next to this one already removed server-side
  test("rolls a failed delete back without resurrecting a comment deleted beside it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.post.deleteComment.mutation(({ input }) => {
        if (input === comment.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return { ancestorIds: [postId], noRemovedComments: 1 };
      }),
    );
    const parentPost = createPost({ id: postId, noComments: 2 });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { deleteComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [comment, otherComment];
    await Promise.all([deleteComment(comment.id, postId), deleteComment(otherComment.id, postId)]);

    expect(getSlice(postId).items.value).toStrictEqual([comment]);
    expect(parentPost.noComments).toBe(1);
  });

  // A delete cascades, so the rows beneath the one removed are gone server-side whether or not anybody had
  // Expanded them. A store that dropped the row alone leaves its replies rendering under a parent that is not
  // There, and the branch they sit in is still keyed by it
  test("drops every loaded reply beneath a deleted comment", async () => {
    expect.hasAssertions();

    const reply = createPost({ depth: 2, parentId: comment.id });
    server.use(trpcMsw.post.deleteComment.mutation(() => ({ ancestorIds: [postId], noRemovedComments: 2 })));
    const parentPost = createPost({ id: postId, noComments: 2 });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { deleteComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [comment];
    getSlice(comment.id).items.value = [reply];

    await deleteComment(comment.id, postId);

    expect(getSlice(postId).items.value).toStrictEqual([]);
    expect(getSlice(comment.id).items.value).toStrictEqual([]);
    expect(parentPost.noComments).toBe(0);
  });

  // The counters the server moved are the ones on screen, so a reply has to reach the post above its own parent
  // As well — a root card reporting only its direct children under-reports its whole thread
  test("counts a reply against every post the server named", async () => {
    expect.hasAssertions();

    // Built here rather than at describe scope: the counters are what this asserts, and the store writes them
    // Into the rows it is handed
    const repliedToComment = createPost({ depth: 1, noComments: 0, parentId: postId });
    const reply = createPost({ depth: 2, parentId: repliedToComment.id });
    server.use(
      trpcMsw.post.createComment.mutation(() => ({ ancestorIds: [postId, repliedToComment.id], comment: reply })),
    );
    const parentPost = createPost({ id: postId, noComments: 1 });
    const commentStore = useCommentStore();
    const { currentPost } = storeToRefs(commentStore);
    const { createComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [repliedToComment];

    await createComment({ description: newDescription, parentId: repliedToComment.id });

    expect(getSlice(repliedToComment.id).items.value).toStrictEqual([reply]);
    expect(takeOne(getSlice(postId).items.value).noComments).toBe(1);
    expect(parentPost.noComments).toBe(2);
  });
});
