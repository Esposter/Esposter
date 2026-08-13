// @vitest-environment nuxt
import { createPost } from "@/services/post/createPost.test";
import { setupMswTrpc, trpcMsw } from "@/services/trpc/mswTrpc.test";
import { usePostStore } from "@/store/post";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(usePostStore, () => {
  const server = setupMswTrpc();
  const post = createPost();
  const otherPost = createPost();
  const newTitle = "newTitle";
  const failingTitle = "failingTitle";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // Two edits of one post queue under the same key, so the second's rollback has to undo its own edit — the
  // Title it read when the user clicked save predates the edit ahead of it, and restoring it leaves a title the
  // Server never accepted on the feed until some later read
  test("rolls a failed edit back to the edit ahead of it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.post.updatePost.mutation(({ input }) => {
        if (input.title === failingTitle) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return createPost({ ...input, id: post.id });
      }),
    );
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { updatePost } = postStore;
    items.value = [createPost({ id: post.id })];
    await Promise.all([updatePost({ id: post.id, title: newTitle }), updatePost({ id: post.id, title: failingTitle })]);

    expect(takeOne(items.value).title).toBe(newTitle);
  });

  // Deletes of different posts carry different keys, so they run beside each other — restoring a copy of the
  // Feed resurrects the post the delete next to this one already removed server-side
  test("rolls a failed delete back without resurrecting a post deleted beside it", async () => {
    expect.hasAssertions();

    server.use(
      trpcMsw.post.deletePost.mutation(({ input }) => {
        if (input === post.id) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "error" });

        return otherPost;
      }),
    );
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { deletePost } = postStore;
    items.value = [post, otherPost];
    await Promise.all([deletePost(post.id), deletePost(otherPost.id)]);

    expect(items.value).toStrictEqual([post]);
  });
});
