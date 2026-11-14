/// <reference types="@cloudflare/workers-types" />
import type { AzureFunction, StorageBucket } from "@esposter/db-schema";
import type { KebabCase } from "type-fest";

// The binding names `nitro.ts` derives from the same enums: a bucket or job is bound under its SCREAMING_SNAKE name
type ScreamingSnakeCase<T extends string> = T extends `${infer Head}-${infer Tail}`
  ? `${Uppercase<Head>}_${ScreamingSnakeCase<Tail>}`
  : Uppercase<T>;
type BucketBindings = { [Bucket in StorageBucket as ScreamingSnakeCase<Bucket>]: R2Bucket };
type QueueBindings = { [Job in AzureFunction as `${ScreamingSnakeCase<KebabCase<Job>>}_QUEUE`]: Queue };

interface Bindings extends BucketBindings, QueueBindings {
  $DurableObject: DurableObjectNamespace;
  ASSETS: Fetcher;
  CORE: D1Database;
  SCHEDULER: DurableObjectNamespace;
  STREAMS: D1Database;
}

declare global {
  namespace Cloudflare {
    interface Env extends Bindings {}
  }
}

export {};
