import type { TRPCRouter } from "@@/server/trpc/routers";
import type { DecorateRouterRecord } from "@trpc/server/unstable-core-do-not-import";

import { createCallerFactory } from "@@/server/trpc";
import { createMockContext } from "@@/server/trpc/context.test";
import { postRouter } from "@@/server/trpc/routers/post";
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

  test.todo("updates", async () => {
    expect.hasAssertions();

    const title = "title";
    const updatedTitle = "updatedTitle";
    const newPost = await caller.createPost({ title });
    const updatedPost = await caller.updatePost({ id: newPost.id, title: updatedTitle });

    expect(updatedPost.title).toBe(updatedTitle);
  });
});
