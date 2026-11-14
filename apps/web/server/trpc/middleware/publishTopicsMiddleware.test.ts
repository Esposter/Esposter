import type { Topic } from "@esposter/db-schema";

import { MockPublishedTopics } from "#server/services/realtime/publishTopics.test";
import { createCallerFactory, publicProcedure, router } from "#server/trpc";
import { createMockContext } from "#server/trpc/context.test";
import { publishTopicsMiddleware } from "#server/trpc/middleware/publishTopicsMiddleware";
import { getTopic } from "#shared/services/realtime/getTopic";
import { TopicKind } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { afterEach, describe, expect, test } from "vitest";
import { z } from "zod";

const postInputSchema = z.object({ id: z.string() });
const getPostTopics = ({ input }: { input: unknown }): Topic[] => [
  getTopic(TopicKind.Post, postInputSchema.parse(input).id),
];

describe("publishTopicsMiddleware", () => {
  const procedure = publicProcedure.use(publishTopicsMiddleware);
  const testRouter = router({
    failPost: procedure
      .meta({ topics: getPostTopics })
      .input(postInputSchema)
      .mutation<void>(() => {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Post failed" });
      }),
    readPost: procedure
      .meta({ topics: getPostTopics })
      .input(postInputSchema)
      .query<boolean>(() => true),
    updatePost: procedure
      .meta({ topics: getPostTopics })
      .input(postInputSchema)
      .mutation<boolean>(() => true),
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
