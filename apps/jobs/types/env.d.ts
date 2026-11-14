import type { JobsEnvironmentVariables } from "#src/models/environment/JobsEnvironmentVariables";
import type { Rpc } from "@cloudflare/workers-types";
import type { CallObjectRpc, RoomObjectRpc, UserObjectRpc } from "@esposter/db-schema";

// The bindings wrangler.jsonc declares, typed once here. A queue is bound by its job's SCREAMING_SNAKE name with a `_QUEUE` suffix.
// A bucket is bound by its purpose's name, and each is the same in both environments. The realtime objects belong to another Worker.
// Each is typed by the RPC surface that the realtime Worker's class implements.
declare global {
  namespace Cloudflare {
    interface Env {
      CALL: DurableObjectNamespace<CallObjectRpc & Rpc.DurableObjectBranded>;
      CLICKER_ASSETS: R2Bucket;
      CORE: D1Database;
      CUTOVER_SECRET: string;
      DELETE_ACCOUNT_QUEUE: Queue;
      DELETE_ORPHANED_PROFILE_IMAGE_QUEUE: Queue;
      EXPORT_USER_DATA_QUEUE: Queue;
      GENSHIN_ASSETS: R2Bucket;
      MESSAGE_ASSETS: R2Bucket;
      PROCESS_BLOB_DELETION_QUEUE: Queue;
      PROCESS_NOTIFICATION_QUEUE: Queue;
      PROCESS_WEBHOOK_QUEUE: Queue;
      PUBLIC_APP_ASSETS: R2Bucket;
      PUBLIC_DUNGEONS_ASSETS: R2Bucket;
      PUBLIC_GENSHIN_ASSETS: R2Bucket;
      PUBLIC_USER_ASSETS: R2Bucket;
      RECONCILE_STORAGE_LEDGER_ENTRY_QUEUE: Queue;
      RESOURCE_ASSETS: R2Bucket;
      ROOM: DurableObjectNamespace<RoomObjectRpc & Rpc.DurableObjectBranded>;
      USER: DurableObjectNamespace<Rpc.DurableObjectBranded & UserObjectRpc>;
      USER_ASSETS: R2Bucket;
    }
  }
  namespace NodeJS {
    interface ProcessEnv extends JobsEnvironmentVariables {}
  }
}

export {};
