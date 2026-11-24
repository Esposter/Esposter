import type { HostedAssetFilesSource } from "#src/models/hostedAssets/HostedAssetFilesSource";
import type { StorageBucket } from "@esposter/db-schema";

// A product whose objects one bucket holds: the bucket they are stored in, the committed lock that names them, and the
// Scopes its lock entries sit under, each the top-level prefix of an object's key. No two products share a scope. A
// Records product's objects are published by its own commands, and a files product's are the files of a repository
// Folder
export interface HostedAssetProduct {
  bucket: StorageBucket;
  lockPath: string;
  // The lock's path from the repository root, as git names it
  lockRepositoryPath: string;
  // The name the tools address the product by, on the command line and in the keys a lock renders under
  name: string;
  scopes: readonly string[];
  source: { kind: "records" } | HostedAssetFilesSource;
}
