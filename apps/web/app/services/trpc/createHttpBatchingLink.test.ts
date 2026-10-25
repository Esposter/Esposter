// @vitest-environment nuxt
import type { TRPCRouter } from "#server/trpc/routers";

import { createHttpBatchingLink } from "@/services/trpc/createHttpBatchingLink";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { createTRPCClient } from "@trpc/client";
import { describe, expect, test } from "vitest";

describe(createHttpBatchingLink, () => {
  const { server, trpcMsw } = setupMswTrpc();
  const firstPostId = crypto.randomUUID();
  const secondPostId = crypto.randomUUID();
  const serveCounts = (ids: string[]) => ids.map((id) => ({ commentCount: 0, id, likeCount: 0 }));

  test("batches two reads sent in one tick into one request", async () => {
    expect.hasAssertions();

    const requestUrls: string[] = [];
    server.events.on("request:start", ({ request }) => {
      requestUrls.push(request.url);
    });
    trpcMsw.post.readPostCounts.query(({ input }) => serveCounts(input));
    const client = createTRPCClient<TRPCRouter>({ links: [createHttpBatchingLink(false)] });
    const [firstCounts, secondCounts] = await Promise.all([
      client.post.readPostCounts.query([firstPostId]),
      client.post.readPostCounts.query([secondPostId]),
    ]);

    expect(requestUrls).toHaveLength(1);
    expect(firstCounts).toStrictEqual(serveCounts([firstPostId]));
    expect(secondCounts).toStrictEqual(serveCounts([secondPostId]));
  });

  // The client a test uses is the test build's, which sends each read as its own request, so a read held open does not
  // Hold the one sent after it. A batched client would answer both as one response, which waits for the held one
  test("A held read does not hold a read sent in the same tick", async () => {
    expect.hasAssertions();

    const heldRead = Promise.withResolvers<void>();
    trpcMsw.post.readPostCounts.query(async ({ input }) => {
      if (input.includes(firstPostId)) await heldRead.promise;

      return serveCounts(input);
    });
    const { $trpc } = useNuxtApp();
    const firstRead = $trpc.post.readPostCounts.query([firstPostId]);
    const secondRead = await $trpc.post.readPostCounts.query([secondPostId]);

    expect(secondRead).toStrictEqual(serveCounts([secondPostId]));
    heldRead.resolve();
    await firstRead;
  });
});
