import type { z } from "zod";

import { jobsEnvironmentVariablesSchema } from "../../../../apps/jobs/src/models/environment/JobsEnvironmentVariables.ts";
import { realtimeEnvironmentVariablesSchema } from "../../../../apps/realtime/src/models/environment/RealtimeEnvironmentVariables.ts";
import { webEnvironmentVariablesSchema } from "../../../../apps/web/shared/models/environment/WebEnvironmentVariables.ts";

// Each Worker's own environment schema, keyed by its name in `.github/worker-secrets.json`.
// A Worker the deploy gathers secrets for is listed here, and a name this map lacks is refused by `pnpm worker-secrets:check`
export const WORKER_ENVIRONMENT_SCHEMAS = new Map<string, z.ZodObject<Record<string, z.ZodType>>>([
  ["jobs", jobsEnvironmentVariablesSchema],
  ["realtime", realtimeEnvironmentVariablesSchema],
  ["web", webEnvironmentVariablesSchema],
]);

// The most secrets one Worker's file holds, the bound its record schema checks
export const WORKER_SECRETS_MAX_ENTRIES = 64;
