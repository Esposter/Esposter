import type { FunctionsEnvironmentVariables } from "#src/models/environment/FunctionsEnvironmentVariables";

import { functionsEnvironmentVariablesSchema } from "#src/models/environment/FunctionsEnvironmentVariables";
import { validateEnvironmentVariables } from "@esposter/shared";

let environment: FunctionsEnvironmentVariables | undefined;

// A Worker has no process start, so the environment is checked on the first invocation of each isolate instead.
// An invocation that finds it incomplete throws before any handler runs.
// This is what stops the first message that needs a missing variable from failing mid-handler.
// Every later invocation returns what the first one checked.
export const validateFunctionsEnvironment = (): FunctionsEnvironmentVariables => {
  environment ??= validateEnvironmentVariables(functionsEnvironmentVariablesSchema, process.env);
  return environment;
};
