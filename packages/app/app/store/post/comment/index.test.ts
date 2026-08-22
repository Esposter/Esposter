// @vitest-environment nuxt
import { createPost } from "@/services/post/createPost.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { useCommentStore } from "@/store/post/comment";
import { RoutePath, takeOne } from "@esposter/shared";
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

  beforeEach(async () => {
    setActivePinia(createPinia());
    // The store keys its list by the post in the route, so a list only exists once one is current
    await navigateTo(RoutePath.Post(postId));
  });

  // Two edits of one comment queue under the same key, so the second's rollback has to undo its own edit rather
  // Than restore the thread as it read at submit time — which predates the edit ahead of it
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
    const { items } = storeToRefs(commentStore);
    const { getSlice, updateComment } = commentStore;
    getSlice(postId).items.value = [createPost({ depth: 1, id: comment.id, parentId: postId })];
    await Promise.all([
      updateComment({ description: newDescription, id: comment.id }),
      updateComment({ description: failingDescription, id: comment.id }),
    ]);

    expect(takeOne(items.value).description).toBe(newDescription);
  });

  // Deletes of different comments carry different keys, so they run beside each other — restoring a copy of the
  // Thread resurrects the comment the delete next to this one already removed server-side
  test("rolls a failed delete back without resurrecting a comment deleted beside it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.post.deleteComment.mutation(({ input }) => {
        if (input === comment.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return otherComment;
      }),
    );
    const parentPost = createPost({ id: postId, noComments: 2 });
    const commentStore = useCommentStore();
    const { currentPost, items } = storeToRefs(commentStore);
    const { deleteComment, getSlice } = commentStore;
    currentPost.value = parentPost;
    getSlice(postId).items.value = [comment, otherComment];
    await Promise.all([deleteComment(comment.id), deleteComment(otherComment.id)]);

    expect(items.value).toStrictEqual([comment]);
    expect(parentPost.noComments).toBe(1);
  });
});
