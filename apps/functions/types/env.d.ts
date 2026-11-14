/// <reference types="@cloudflare/workers-types" />
import type { FunctionsEnvironmentVariables } from "#src/models/environment/FunctionsEnvironmentVariables";
import type { SchedulerObject } from "@esposter/db-schema";

// The bindings wrangler.jsonc declares, typed once here. A queue is bound by its job's SCREAMING_SNAKE name with a
// `_QUEUE` suffix, a bucket by its purpose's name, and each is the same in both environments
declare global {
  namespace Cloudflare {
    interface Env {
      CLICKER_ASSETS: R2Bucket;
      CORE: D1Database;
      DELETE_ACCOUNT_QUEUE: Queue;
      DELETE_ORPHANED_PROFILE_IMAGE_QUEUE: Queue;
      EXPORT_USER_DATA_QUEUE: Queue;
      GENSHIN_ASSETS: R2Bucket;
      MESSAGE_ASSETS: R2Bucket;
      PROCESS_BLOB_DELETION_QUEUE: Queue;
      PROCESS_NOTIFICATION_QUEUE: Queue;
      PROCESS_SCHEDULED_MESSAGE_JOB_QUEUE: Queue;
      PROCESS_WEBHOOK_QUEUE: Queue;
      PUBLIC_APP_ASSETS: R2Bucket;
      PUBLIC_DUNGEONS_ASSETS: R2Bucket;
      PUBLIC_GENSHIN_ASSETS: R2Bucket;
      PUBLIC_USER_ASSETS: R2Bucket;
      RECONCILE_STORAGE_LEDGER_ENTRY_QUEUE: Queue;
      RESOURCE_ASSETS: R2Bucket;
      SCHEDULER: DurableObjectNamespace<Rpc.DurableObjectBranded & SchedulerObject>;
      SEND_TODO_REMINDER_QUEUE: Queue;
      SERVER: DurableObjectNamespace;
      STREAMS: D1Database;
      USER_ASSETS: R2Bucket;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends FunctionsEnvironmentVariables {}
  }
}

export {};
