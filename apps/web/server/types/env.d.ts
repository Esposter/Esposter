import type { SchedulerObject } from "@esposter/db-schema";

declare global {
  namespace Cloudflare {
    interface Env {
      SCHEDULER: DurableObjectNamespace<Rpc.DurableObjectBranded & SchedulerObject>;
    }
  }
}

export {};
