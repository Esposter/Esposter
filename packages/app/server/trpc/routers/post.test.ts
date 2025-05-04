import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { postRouter } from "@@/server/trpc/routers/post";
import { NIL } from "@esposter/shared";
import { beforeEach, describe, expect, test } from "vitest";

describe("post", () => {
  let caller: DecorateRouterRecord<TRPCRouter["post"]>;

  beforeEach(async () => {
    const createCaller = createCallerFactory(postRouter);
    const mockContext = await createMockContext();
    caller = createCaller(mockContext);
  });

  test("creates", async () => {
    expect.hasAssertions();

    const title = "title";
    const description = "description";
    const newPost = await caller.createPost({ description, title });

    expect(newPost.title).toBe(title);
    expect(newPost.description).toBe(description);
  });

  test("updates", async () => {
    expect.hasAssertions();

    const title = "title";
    const updatedTitle = "updatedTitle";
    const newPost = await caller.createPost({ title });
    const updatedPost = await caller.updatePost({ id: newPost.id, title: updatedTitle });

    expect(updatedPost.title).toBe(updatedTitle);
  });

  test("fails update with non-existent item", async () => {
    expect.hasAssertions();

    await expect(caller.updatePost({ id: NIL })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post is not found for id: 00000000-0000-0000-0000-000000000000]`,
    );
  });

  test("deletes", async () => {
    expect.hasAssertions();

    const title = "title";
    const newPost = await caller.createPost({ title });
    const deletedPost = await caller.deletePost(newPost.id);

    expect(deletedPost.id).toBe(newPost.id);
  });

  test("fails delete with non-existent item", async () => {
    expect.hasAssertions();

    await expect(caller.deletePost(NIL)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Invalid operation: Delete, name: Post, 00000000-0000-0000-0000-000000000000]`,
    );
  });
});
