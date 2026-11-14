import { StorageBucket, AzureFunction } from "@esposter/db-schema";
import { CORE_BINDING, STREAMS_BINDING } from "#src/services/constants";
import type { MiniflareBinding } from "miniflare";

// One R2 bucket per storage bucket and one Queue per job, each bound under its own name, so a test reaches one by its enum value
export const getMockBindings = (): Record<string, MiniflareBinding> => ({
  [CORE_BINDING]: { id: crypto.randomUUID(), type: "d1" },
  [STREAMS_BINDING]: { id: crypto.randomUUID(), type: "d1" },
  ...Object.fromEntries(Object.values(StorageBucket).map((bucket) => [bucket, { name: bucket, type: "r2" as const }])),
  ...Object.fromEntries(Object.values(AzureFunction).map((job) => [job, { name: job, type: "queue" as const }])),
});
