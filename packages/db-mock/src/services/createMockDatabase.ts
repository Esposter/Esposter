import type { MockDatabase } from "#src/models/MockDatabase";

import { StorageBucket, relations } from "@esposter/db-schema";
import { env } from "#src/cloudflareWorkers";
import { COMPATIBILITY_DATE, CORE_BINDING, STREAMS_BINDING } from "#src/services/constants";
import { emptyD1Database } from "#src/services/emptyD1Database";
import { emptyR2Bucket } from "#src/services/emptyR2Bucket";
import { getMockBindings } from "#src/services/getMockBindings";
import { drizzle } from "drizzle-orm/d1";
import { migrate } from "drizzle-orm/d1/migrator";
import { Miniflare } from "miniflare";

// The Worker has no code of its own here, so its entry module only has to exist; the bindings are what a test uses
const MOCK_WORKER_MODULE = "export default {};";

// One Miniflare instance per call. The migrations are applied from their folders, the same SQL production runs
export const createMockDatabase = async (
  coreMigrationsDirectory: string,
  streamsMigrationsDirectory: string,
): Promise<MockDatabase> => {
  const miniflare = new Miniflare({
    workers: [
      {
        config: {
          compatibilityDate: COMPATIBILITY_DATE,
          env: getMockBindings(),
          manifest: { mainModule: "index.js", modules: { "index.js": { type: "esm", contents: MOCK_WORKER_MODULE } } },
          name: "db-mock",
        },
      },
    ],
  });
  Object.assign(env, await miniflare.getBindings());
  const coreDatabase = await miniflare.getD1Database(CORE_BINDING);
  const streamsDb = await miniflare.getD1Database(STREAMS_BINDING);
  const db = drizzle(coreDatabase, { relations });
  await migrate(db, { migrationsFolder: coreMigrationsDirectory });
  await migrate(drizzle(streamsDb), { migrationsFolder: streamsMigrationsDirectory });

  return {
    db,
    dispose: () => miniflare.dispose(),
    getBucket: (bucket) => miniflare.getR2Bucket(bucket),
    getQueue: (job) => miniflare.getQueueProducer(job),
    reset: async () => {
      await Promise.all([
        emptyD1Database(coreDatabase),
        emptyD1Database(streamsDb),
        ...Object.values(StorageBucket).map(async (bucket) => emptyR2Bucket(await miniflare.getR2Bucket(bucket))),
      ]);
    },
    streamsDb,
  };
};
