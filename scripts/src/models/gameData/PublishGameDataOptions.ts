import type { R2BucketClient } from "#src/models/cloudflare/R2BucketClient";
import type { GameDataScope } from "#src/models/gameData/GameDataScope";
import type { GameDataPublication } from "#src/models/shared/GameDataPublication";
import type { CloudflareEnvironment } from "@esposter/db-schema";
import type { GameDataLock } from "genshin-world";

export interface PublishGameDataOptions {
  // Makes the buckets to publish to, absent for a dry run, which reads and writes no bucket and needs no credential. It is
  // Called only once a publication stores an object or drops a lock entry, so an empty publication that leaves the lock as it
  // Is makes no bucket and no credential
  createBucketClientMap?: () => Record<CloudflareEnvironment, R2BucketClient>;
  // The lock as the working tree has it, which the publication replaces the scopes of
  currentLock: GameDataLock;
  publication: GameDataPublication;
  // The datasets whose entries the publication replaces wholesale, or the single keys it replaces, and no other entry of
  // The lock is touched
  scopes: GameDataScope[];
}
