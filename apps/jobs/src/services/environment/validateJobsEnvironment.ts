import type { JobsEnvironmentVariables } from "#src/models/environment/JobsEnvironmentVariables";

import { jobsEnvironmentVariablesSchema } from "#src/models/environment/JobsEnvironmentVariables";
import { validateEnvironmentVariables } from "@esposter/shared";

let environment: JobsEnvironmentVariables | undefined;

// A Worker has no process start, so the environment is checked on the first invocation of each isolate instead.
// An invocation that finds it incomplete throws before any handler runs.
// This is what stops the first message that needs a missing variable from failing mid-handler.
// Every later invocation returns what the first one checked.
export const validateJobsEnvironment = (): JobsEnvironmentVariables => {
  environment ??= validateEnvironmentVariables(jobsEnvironmentVariablesSchema, process.env);
  return environment;
};
