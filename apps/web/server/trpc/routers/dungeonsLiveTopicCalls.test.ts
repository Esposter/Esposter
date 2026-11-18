import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createCallerFactory } from "#server/trpc/index";
import { trpcRouter } from "#server/trpc/routers/index";
import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";

// The dungeons' save is a blob in the user's assets, so its read names the blob and its save publishes it
export const createDungeonsLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  ({ bucket: mockBuckets[StorageBucket.UserAssets] } = await createMockBucket(StorageBucket.UserAssets));
  // The save is stored first, since a read with no save answers a fresh model whose id and dates differ on every call, so the
  // Read is stable until the write changes it
  await createCallerFactory(trpcRouter)(context).dungeons.saveDungeons({ data: new Dungeons() });
  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).dungeons.readDungeons(),
        path: "dungeons.readDungeons",
      },
    ],
    writes: [
      {
        // A save is sent under the ETag its read returned, as the client sends it, so the write replaces the stored save
        call: async (callContext) => {
          const caller = createCallerFactory(trpcRouter)(callContext);
          const { etag } = await caller.dungeons.readDungeons();
          return caller.dungeons.saveDungeons({ data: new Dungeons(), etag });
        },
        path: "dungeons.saveDungeons",
      },
    ],
  };
};
