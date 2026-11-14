import type {
  CallObjectRpc,
  CloudflareEnvironment,
  QueueJobBindingName,
  RateLimiterBinding,
  RoomObjectRpc,
  StorageBucket,
  UserObjectRpc,
} from "@esposter/db-schema";

// The binding names `nitro.ts` derives from the same enum: a bucket is bound under its SCREAMING_SNAKE name. Producers sit
// On `Env` beside the bindings, one per job, under the names `QueueJobBindingNameMap` gives
interface Bindings extends BucketBindings, RateLimiterBindings {
  ASSETS: Fetcher;
  CALL: DurableObjectNamespace<CallObjectRpc & Rpc.DurableObjectBranded>;
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  CORE: D1Database;
  ROOM: DurableObjectNamespace<RoomObjectRpc & Rpc.DurableObjectBranded>;
  USER: DurableObjectNamespace<Rpc.DurableObjectBranded & UserObjectRpc>;
}
type BucketBindings = { [Bucket in StorageBucket as ScreamingSnakeCase<Bucket>]: R2Bucket };
// One rate limit per limiter, declared in `configuration/wrangler.ts` under the names `RateLimiterBinding` gives
type RateLimiterBindings = Record<RateLimiterBinding, RateLimit>;
type ScreamingSnakeCase<T extends string> = T extends `${infer Head}-${infer Tail}`
  ? `${Uppercase<Head>}_${ScreamingSnakeCase<Tail>}`
  : Uppercase<T>;

declare global {
  namespace Cloudflare {
    // One producer per job, read by getJobQueue under the job's binding name
    interface Env extends Bindings, Record<QueueJobBindingName, Queue> {}
  }
}

export {};
