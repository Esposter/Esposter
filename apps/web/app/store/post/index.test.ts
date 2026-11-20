// @vitest-environment nuxt
import { createPost } from "#src/services/post/createPost.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { usePostStore } from "#src/store/post/index";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { describe, expect, test } from "vitest";

describe(usePostStore, () => {
  const { trpcMsw } = setupMswTrpc();
  const post = createPost();
  const otherPost = createPost();
  const newTitle = "newTitle";
  const failingTitle = "failingTitle";

  // The create page navigates to what was just written, which is the only place the server-generated id
  // Reaches it — and a rejected create has no post to open, so it must hand back nothing rather than a row
  test("hands the created post back to its caller", async () => {
    expect.hasAssertions();

    trpcMsw.post.createPost.mutation(({ input }) => createPost({ ...input, id: post.id }));
    const postStore = usePostStore();
    const { createPost: storeCreatePost } = postStore;

    const createdPost = await storeCreatePost({ description: "", title: newTitle });

    expect(createdPost?.id).toBe(post.id);
  });

  test("hands nothing back when the create is rejected", async () => {
    expect.hasAssertions();

    trpcMsw.post.createPost.mutation(() => {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
    });
    const postStore = usePostStore();
    const { createPost: storeCreatePost } = postStore;

    await expect(storeCreatePost({ description: "", title: newTitle })).resolves.toBeUndefined();
  });

  // Two edits of one post are written to the one row in issue order, and a refused edit drops its own entry: the row
  // is left at the edit the server kept, with nothing restored over it
  test("leaves the feed on the edit the server kept when a later edit is refused", async () => {
    expect.hasAssertions();

    trpcMsw.post.updatePost.mutation(({ input }) => {
      if (input.title === failingTitle) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return createPost({ ...input, id: post.id, version: 1 });
    });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { readItems, readPostPage, updatePost } = postStore;
    await readItems(async () => readPostPage({ items: [createPost({ id: post.id })], nextCursor: "" }));
    updatePost({ id: post.id, title: newTitle });
    updatePost({ id: post.id, title: failingTitle });

    // The refused edit is drawn over the kept one until its refusal drops it, so the feed shows the kept title only once
    // both are settled
    await until(() => takeOne(items.value).title).toBe(newTitle);
    expect(takeOne(items.value).version).toBe(1);
  });

  // A refused delete leaves its post on the feed, since the row was never removed on the server and its entry drops
  // with the refusal. Deletes of different posts carry different keys, so the accepted one is not held behind it
  test("keeps a post whose delete is refused, and drops one whose delete the server kept", async () => {
    expect.hasAssertions();

    const isRefusedDeleteReceived = Promise.withResolvers<void>();
    trpcMsw.post.deletePost.mutation(({ input }) => {
      if (input === post.id) {
        isRefusedDeleteReceived.resolve();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }

      return [otherPost.id];
    });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { deletePost, readItems, readPostPage } = postStore;
    await readItems(async () => readPostPage({ items: [post, otherPost], nextCursor: "" }));
    deletePost(post.id);
    deletePost(otherPost.id);

    // The refused post is drawn again once its refusal lands, so the list holds the one post only after both are settled
    await isRefusedDeleteReceived.promise;
    await until(() => items.value.length).toBe(1);
    expect(takeOne(items.value).id).toBe(post.id);
  });
});
