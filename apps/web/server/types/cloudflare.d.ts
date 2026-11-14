import type {
  CallObjectRpc,
  CloudflareEnvironment,
  QueueJobBindingName,
  RateLimiterBinding,
  RoomObjectRpc,
  StorageBucket,
  UserObjectRpc,
} from "@esposter/db-schema";

// The binding names `nitro.ts` derives from the same enum: a bucket is bound under its SCREAMING_SNAKE name. The queue
// producers sit on `Env` beside the bindings, one per job, under the names `QueueJobBindingNameMap` gives
type ScreamingSnakeCase<T extends string> = T extends `${infer Head}-${infer Tail}`
  ? `${Uppercase<Head>}_${ScreamingSnakeCase<Tail>}`
  : Uppercase<T>;
type BucketBindings = { [Bucket in StorageBucket as ScreamingSnakeCase<Bucket>]: R2Bucket };
// One rate limit per limiter, declared in `configuration/wrangler.ts` under the names `RateLimiterBinding` gives
type RateLimiterBindings = { [Binding in RateLimiterBinding]: RateLimit };

interface Bindings extends BucketBindings, RateLimiterBindings {
  ASSETS: Fetcher;
  CALL: DurableObjectNamespace<Rpc.DurableObjectBranded & CallObjectRpc>;
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  CORE: D1Database;
  ROOM: DurableObjectNamespace<Rpc.DurableObjectBranded & RoomObjectRpc>;
  STREAMS: D1Database;
  USER: DurableObjectNamespace<Rpc.DurableObjectBranded & UserObjectRpc>;
}

declare global {
  namespace Cloudflare {
    // One producer per job, read by getJobQueue under the job's binding name
    interface Env extends Bindings, Record<QueueJobBindingName, Queue> {}
  }
}

export {};
