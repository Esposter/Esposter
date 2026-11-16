import type { MockDatabase } from "#src/models/MockDatabase";

import { env } from "#src/cloudflareWorkers";
import { CORE_BINDING } from "#src/services/constants";
import { emptyD1Database } from "#src/services/emptyD1Database";
import { emptyR2Bucket } from "#src/services/emptyR2Bucket";
import { getMockBindings } from "#src/services/getMockBindings";
import { relations, StorageBucket } from "@esposter/db-schema";
import { drizzle } from "drizzle-orm/d1";
import { migrate } from "drizzle-orm/d1/migrator";
import { Miniflare } from "miniflare";

// The Worker has no code of its own here, so its entry module only has to exist; the bindings are what a test uses
const MOCK_WORKER_MODULE = "export default {};";

// One Miniflare instance per call. The migrations are applied from their folder, the same SQL production runs. A persisted
// Root keeps the database on disk under its `d1` folder, so the dev seed writes the file a dev server opens
export const createMockDatabase = async (
  coreMigrationsDirectory: string,
  persistRoot?: string,
): Promise<MockDatabase> => {
  const miniflare = new Miniflare({
    resourcePersistencePath: persistRoot,
    workers: [
      {
        config: {
          // The Worker is a stand-in with no code of its own, so the date only has to be one the installed workerd accepts.
          // Miniflare refuses a date later than the machine's clock, so a date long past, the one its own fallback uses,
          // Is the one every clock accepts
          compatibilityDate: "2000-01-01",
          env: getMockBindings(),
          manifest: { mainModule: "index.js", modules: { "index.js": { contents: MOCK_WORKER_MODULE, type: "esm" } } },
          name: "db-mock",
        },
      },
    ],
  });
  Object.assign(env, await miniflare.getBindings());
  const coreDatabase = await miniflare.getD1Database(CORE_BINDING);
  const db = drizzle(coreDatabase, { relations });
  await migrate(db, { migrationsFolder: coreMigrationsDirectory });

  return {
    coreDatabase,
    db,
    dispose: () => miniflare.dispose(),
    getBucket: (bucket) => miniflare.getR2Bucket(bucket),
    getQueue: (job) => miniflare.getQueueProducer(job),
    reset: async () => {
      await Promise.all([
        emptyD1Database(coreDatabase),
        ...Object.values(StorageBucket).map(async (bucket) => emptyR2Bucket(await miniflare.getR2Bucket(bucket))),
      ]);
    },
  };
};
