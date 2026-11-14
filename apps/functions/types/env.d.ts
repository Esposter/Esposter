import type { FunctionsEnvironmentVariables } from "#src/models/environment/FunctionsEnvironmentVariables";
import type { SchedulerObject } from "@esposter/db-schema";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends FunctionsEnvironmentVariables {}
  }

  namespace Cloudflare {
    // A queue binding is named after the job it carries, so a Scheduler sends to it by the job's own name
    interface Env {
      ProcessScheduledMessageJob: Queue;
      SCHEDULER: DurableObjectNamespace<Rpc.DurableObjectBranded & SchedulerObject>;
      SendTodoReminder: Queue;
    }
  }
}

export {};
