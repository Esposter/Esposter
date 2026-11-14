import type { Topic } from "@esposter/db-schema";

import { MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { createCallerFactory, router } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { getTopicsProcedure } from "#server/trpc/procedure/getTopicsProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { getTopic } from "#shared/services/realtime/getTopic";
import { TopicKind } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { afterEach, describe, expect, test } from "vitest";
import { z } from "zod";

const postInputSchema = z.object({ id: z.string() });
const getPostTopics = ({ input }: { input: z.output<typeof postInputSchema> }): Topic[] => [
  getTopic(TopicKind.Post, input.id),
];

describe(getTopicsProcedure, () => {
  const postProcedure = getTopicsProcedure(standardRateLimitedProcedure.input(postInputSchema), getPostTopics);
  const testRouter = router({
    failPost: postProcedure.mutation<void>(() => {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Post failed" });
    }),
    readPost: postProcedure.query<boolean>(() => true),
    updatePost: postProcedure.mutation<boolean>(() => true),
  });
  const createTestCaller = createCallerFactory(testRouter);
  const id = "id";

  afterEach(() => {
    MockPublishedTopics.length = 0;
  });

  test("publishes a mutation's topics once it resolves", async () => {
    expect.hasAssertions();

    const caller = createTestCaller(await createMockContext());
    await caller.updatePost({ id });

    expect(MockPublishedTopics).toStrictEqual([getTopic(TopicKind.Post, id)]);
  });

  test("publishes nothing for a failed mutation or for a query", async () => {
    expect.hasAssertions();

    const caller = createTestCaller(await createMockContext());
    await expect(caller.failPost({ id })).rejects.toThrowErrorMatchingInlineSnapshot(`[TRPCError: Post failed]`);
    await caller.readPost({ id });

    expect(MockPublishedTopics).toStrictEqual([]);
  });
});
