import type { MiniflareBinding } from "miniflare";

import { CORE_BINDING, CORE_DATABASE_NAME } from "#src/services/constants";
import { QueueJob, StorageBucket } from "@esposter/db-schema";

// One R2 bucket per storage bucket and one Queue per job, each bound under its own name, so a test reaches one by its enum value.
// A D1 database is keyed by its name, the key a dev server's local file is named by, so a persisted run reopens the same file
export const getMockBindings = (): Record<string, MiniflareBinding> => ({
  [CORE_BINDING]: { id: CORE_DATABASE_NAME, type: "d1" },
  ...Object.fromEntries(Object.values(StorageBucket).map((bucket) => [bucket, { name: bucket, type: "r2" as const }])),
  ...Object.fromEntries(Object.values(QueueJob).map((job) => [job, { name: job, type: "queue" as const }])),
});
