import type {
  D1Database,
  DurableObjectNamespace,
  Fetcher,
  Queue,
  R2Bucket,
  RateLimit,
  Rpc,
} from "@cloudflare/workers-types";
import type {
  CallObjectRpc,
  CloudflareEnvironment,
  QueueJobBindingName,
  RateLimiterBinding,
  RoomObjectRpc,
  StorageBucket,
  TopicObjectRpc,
  UserObjectRpc,
} from "@esposter/db-schema";
import type { ScreamingSnakeCase } from "type-fest";

// One producer per job, read by getJobQueue under the job's binding name. The bindings are typed from the package's
// Importable form, so the browser programs, which hold no Workers globals, type `env` the same way through
// `app/types/cloudflareWorkers.d.ts`
export interface CloudflareEnv extends Bindings, Record<QueueJobBindingName, Queue> {}

// The binding names `nitro.ts` derives from the same enum: a bucket is bound under its SCREAMING_SNAKE name. Producers sit
// On `Env` beside the bindings, one per job, under the names `QueueJobBindingNameMap` gives
interface Bindings extends BucketBindings, RateLimiterBindings {
  ASSETS: Fetcher;
  CALL: DurableObjectNamespace<CallObjectRpc & Rpc.DurableObjectBranded>;
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  CORE: D1Database;
  ROOM: DurableObjectNamespace<RoomObjectRpc & Rpc.DurableObjectBranded>;
  TOPIC: DurableObjectNamespace<Rpc.DurableObjectBranded & TopicObjectRpc>;
  USER: DurableObjectNamespace<Rpc.DurableObjectBranded & UserObjectRpc>;
}

type BucketBindings = { [Bucket in StorageBucket as ScreamingSnakeCase<Bucket>]: R2Bucket };
// One rate limit per limiter, declared in `configuration/wrangler.ts` under the names `RateLimiterBinding` gives
type RateLimiterBindings = Record<RateLimiterBinding, RateLimit>;

declare global {
  namespace Cloudflare {
    interface Env extends CloudflareEnv {}
  }
}
