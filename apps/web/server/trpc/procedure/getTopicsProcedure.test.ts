import type { Topic } from "@esposter/db-schema";

import { getMockPublishedTopics, MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { createMockContext } from "#server/trpc/context.test";
import { createCallerFactory, router } from "#server/trpc/index";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { readTopicsHeader } from "#shared/services/realtime/readTopicsHeader";
import { getTopic, TopicKind } from "@esposter/db-schema";
import { noop } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { afterEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

describe(getTopicsProcedure, () => {
  const postInputSchema = z.object({ id: z.string() });
  const getPostTopics = ({ input }: { input: z.output<typeof postInputSchema> }): Topic[] => [
    getTopic(TopicKind.Post, input.id),
  ];
  const postProcedure = getTopicsProcedure(standardRateLimitedProcedure.input(postInputSchema), getPostTopics);
  // The ids the write-then-fail mutation wrote before it threw
  const written: string[] = [];
  const testRouter = router({
    readPost: postProcedure.query<boolean>(() => true),
    updatePost: postProcedure.mutation<boolean>(() => true),
    writeThenFailPost: postProcedure.mutation<void>(({ input }) => {
      written.push(input.id);
      throw new TRPCError({ code: "BAD_REQUEST", message: "Post failed" });
    }),
  });
  const createTestCaller = createCallerFactory(testRouter);
  const id = "id";

  afterEach(() => {
    MockPublishedTopics.length = 0;
    written.length = 0;
  });

  test("publishes a mutation's topics once it resolves", async () => {
    expect.hasAssertions();

    const caller = createTestCaller(await createMockContext());
    await caller.updatePost({ id });

    expect(getMockPublishedTopics()).toStrictEqual([getTopic(TopicKind.Post, id)]);
  });

  test("sends a query's topics back on its response, and publishes nothing for it", async () => {
    expect.hasAssertions();

    const mockContext = await createMockContext();
    await createTestCaller(mockContext).readPost({ id });

    expect(
      readTopicsHeader(mockContext.responseHeaders, "readPost").flatMap(({ topics }) =>
        topics.map(({ topic }) => topic),
      ),
    ).toStrictEqual([getTopic(TopicKind.Post, id)]);
    expect(getMockPublishedTopics()).toStrictEqual([]);
  });

  // A mutation that fails after its write still publishes its topics, since the write landed before the failure
  test("publishes a mutation's topics when it fails after its write", async () => {
    expect.hasAssertions();

    const caller = createTestCaller(await createMockContext());
    await expect(caller.writeThenFailPost({ id })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[TRPCError: Post failed]`,
    );

    expect(written).toStrictEqual([id]);
    expect(getMockPublishedTopics()).toStrictEqual([getTopic(TopicKind.Post, id)]);
  });

  test("a mutation whose topics cannot be read still resolves, since its write has committed", async () => {
    expect.hasAssertions();

    const unreadableTopicsRouter = router({
      updateUnreadable: getTopicsProcedure(standardRateLimitedProcedure.input(postInputSchema), () => {
        throw new Error("Unreadable output");
      }).mutation<boolean>(() => true),
    });
    const caller = createCallerFactory(unreadableTopicsRouter)(await createMockContext());
    vi.spyOn(console, "error").mockImplementation(noop);

    await expect(caller.updateUnreadable({ id })).resolves.toBe(true);
    expect(getMockPublishedTopics()).toStrictEqual([]);
  });
});
