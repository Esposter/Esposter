import type { R2Bucket } from "@cloudflare/workers-types";
import type { StorageBucket } from "@esposter/db-schema";

// The buckets a suite has opened, all served by one Miniflare instance that the suite disposes.
// A suite opens the buckets it touches in its beforeAll, because the binding this stands in for is read synchronously
export const mockBuckets: Map<StorageBucket, R2Bucket> = new Map<StorageBucket, R2Bucket>();

// The disposers of the Miniflare instances a suite has opened, each run once by disposeMockBuckets
export const mockBucketDisposers: Set<() => Promise<void>> = new Set<() => Promise<void>>();
