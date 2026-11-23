import type { StorageBucket } from "@esposter/db-schema";

// A product whose objects one bucket holds: the bucket they are stored in, the committed lock that names them, and the
// Scopes its lock entries sit under, each the top-level prefix of an object's key. No two products share a scope
export interface HostedAssetProduct {
  bucket: StorageBucket;
  lockPath: string;
  // The lock's path from the repository root, as git names it
  lockRepositoryPath: string;
  scopes: readonly string[];
}
