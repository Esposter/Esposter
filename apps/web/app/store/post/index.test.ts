// @vitest-environment nuxt
import { createPost } from "#src/services/post/createPost.test";
import { createRemovedPost } from "#src/services/post/createRemovedPost.test";
import { setupMswTrpc } from "#src/services/trpc/mswTrpc.test";
import { usePostStore } from "#src/store/post/index";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { flushPromises } from "@vue/test-utils";
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

  // The feed keeps a created post where its sort places it: a Hot feed ranks by ranking before id, so a new post ranked
  // Between two held posts is drawn between them rather than at the bottom
  test("places a created post where the feed's sort places it", async () => {
    expect.hasAssertions();

    const rankedPost = createPost({ ranking: 2 });
    const createdPost = createPost({ ranking: 1 });
    trpcMsw.post.createPost.mutation(() => createdPost);
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { createPost: storeCreatePost, readItems, readPostPage } = postStore;
    await readItems(() => Promise.resolve(readPostPage({ items: [rankedPost, otherPost], nextCursor: "" })));

    await storeCreatePost({ description: "", title: newTitle });

    expect(items.value.map(({ id }) => id)).toStrictEqual([rankedPost.id, createdPost.id, otherPost.id]);
  });

  // Two edits of one post are written to the one row in issue order, and a refused edit drops its own entry: the row
  // Is left at the edit the server kept, with nothing restored over it
  test("leaves the feed on the edit the server kept when a later edit is refused", async () => {
    expect.hasAssertions();

    trpcMsw.post.updatePost.mutation(({ input }) => {
      if (input.title === failingTitle) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });

      return createPost({ ...input, id: post.id, version: 1 });
    });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { readItems, readPostPage, updatePost } = postStore;
    await readItems(() => Promise.resolve(readPostPage({ items: [createPost({ id: post.id })], nextCursor: "" })));
    updatePost({ id: post.id, title: newTitle });
    updatePost({ id: post.id, title: failingTitle });

    // The refused edit is drawn over the kept one until its refusal drops it, so the feed shows the kept title only
    // Once both are settled
    await until(() => takeOne(items.value).title).toBe(newTitle);
    expect(takeOne(items.value).version).toBe(1);
  });

  // A refused delete leaves its post on the feed, since the row was never removed on the server. The accepted delete of
  // Another post removes only that post, so the refused one is still listed
  test("keeps a post whose delete is refused, and drops one whose delete the server kept", async () => {
    expect.hasAssertions();

    const isRefusedDeleteReceived = Promise.withResolvers<void>();
    trpcMsw.post.deletePost.mutation(({ input }) => {
      if (input === post.id) {
        isRefusedDeleteReceived.resolve();
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: " " });
      }

      return [createRemovedPost(otherPost)];
    });
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { deletePost, readItems, readPostPage } = postStore;
    await readItems(() => Promise.resolve(readPostPage({ items: [post, otherPost], nextCursor: "" })));
    // The list holds the one post only once both deletes are settled, the refused one still on it
    await Promise.all([deletePost(post.id), deletePost(otherPost.id)]);
    await isRefusedDeleteReceived.promise;
    await until(() => items.value.length).toBe(1);
    expect(takeOne(items.value).id).toBe(post.id);
  });

  // A read answered before a removal can arrive after it, naming the post at the version it held then. The removal's
  // Tombstone is held at a later version, so that older row loses and the post stays off the feed
  test("does not relist a removed post when a read answered before the removal arrives after it", async () => {
    expect.hasAssertions();

    // The tombstone is dated now, as the server dates a removal: one dated past the retention counts as nothing held,
    // And A read that arrives late would then bring the post back
    trpcMsw.post.deletePost.mutation(() => [{ ...createRemovedPost(post), deletedAt: new Date() }]);
    const postStore = usePostStore();
    const { items } = storeToRefs(postStore);
    const { deletePost, readItems, readPostPage } = postStore;
    await readItems(() => Promise.resolve(readPostPage({ items: [post], nextCursor: "" })));
    await deletePost(post.id);
    await flushPromises();

    await readItems(() => Promise.resolve(readPostPage({ items: [post], nextCursor: "" })));

    expect(items.value).toHaveLength(0);
  });
});
