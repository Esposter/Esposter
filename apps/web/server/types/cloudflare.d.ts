/// <reference types="@cloudflare/workers-types" />
import type {
  CallObjectRpc,
  CloudflareEnvironment,
  RoomObjectRpc,
  StorageBucket,
  UserObjectRpc,
} from "@esposter/db-schema";

// The binding names `nitro.ts` derives from the same enum: a bucket is bound under its SCREAMING_SNAKE name. The queue
// producers are declared in `shared/types/env.d.ts`, under the names `QueueJobBindingNameMap` gives
type ScreamingSnakeCase<T extends string> = T extends `${infer Head}-${infer Tail}`
  ? `${Uppercase<Head>}_${ScreamingSnakeCase<Tail>}`
  : Uppercase<T>;
type BucketBindings = { [Bucket in StorageBucket as ScreamingSnakeCase<Bucket>]: R2Bucket };

interface Bindings extends BucketBindings {
  ASSETS: Fetcher;
  CALL: DurableObjectNamespace<Rpc.DurableObjectBranded & CallObjectRpc>;
  CLOUDFLARE_ENVIRONMENT: CloudflareEnvironment;
  CORE: D1Database;
  ROOM: DurableObjectNamespace<Rpc.DurableObjectBranded & RoomObjectRpc>;
  SCHEDULER: DurableObjectNamespace;
  STREAMS: D1Database;
  USER: DurableObjectNamespace<Rpc.DurableObjectBranded & UserObjectRpc>;
}

declare global {
  namespace Cloudflare {
    interface Env extends Bindings {}
  }
}

export {};
