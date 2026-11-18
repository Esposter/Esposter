import type { Context } from "#server/trpc/context";
import type { LiveTopicCalls } from "#server/trpc/routers/liveTopicCoverage.test";

import { mockBuckets } from "#server/services/storage/getBucket.test";
import { createCallerFactory } from "#server/trpc/index";
import { trpcRouter } from "#server/trpc/routers/index";
import { ClickerSave } from "#shared/models/clicker/data/ClickerSave";
import { createMockBucket } from "@esposter/db-mock";
import { StorageBucket } from "@esposter/db-schema";

// The clicker's save is a blob, so its read names the blob and its save publishes it. The read and the save are the two cases
export const createClickerLiveTopicCalls = async (context: Context): Promise<LiveTopicCalls> => {
  ({ bucket: mockBuckets[StorageBucket.ClickerAssets] } = await createMockBucket(StorageBucket.ClickerAssets));
  // The save is stored first, since a read with no save answers a fresh model whose id and dates differ on every call, so the
  // Read is stable until the write changes it
  await createCallerFactory(trpcRouter)(context).clicker.saveClicker({ data: new ClickerSave() });
  return {
    queries: [
      {
        call: (callContext) => createCallerFactory(trpcRouter)(callContext).clicker.readClicker(),
        path: "clicker.readClicker",
      },
    ],
    writes: [
      {
        // A save is sent under the ETag its read returned, as the client sends it, so the write replaces the stored save
        call: async (callContext) => {
          const caller = createCallerFactory(trpcRouter)(callContext);
          const { etag } = await caller.clicker.readClicker();
          return caller.clicker.saveClicker({ data: new ClickerSave(), etag });
        },
        path: "clicker.saveClicker",
      },
    ],
  };
};
