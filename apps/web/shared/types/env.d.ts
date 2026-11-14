/// <reference types="@cloudflare/workers-types" />
import type { WebEnvironmentVariables } from "#shared/models/environment/WebEnvironmentVariables";
import type { QueueJobBindingName } from "@esposter/db-schema";

declare global {
  namespace Cloudflare {
    // One producer per job, read by getJobQueue under the job's binding name
    interface Env extends Record<QueueJobBindingName, Queue> {}
  }
  namespace NodeJS {
    interface ProcessEnv extends WebEnvironmentVariables {}
  }
}

export {};
