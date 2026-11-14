import { functionsEnvironmentVariablesSchema } from "#src/models/environment/FunctionsEnvironmentVariables";
import { validateEnvironmentVariables } from "@esposter/shared";

let isValidated = false;

// A Worker has no process start, so the environment is checked on the first invocation of each isolate instead. An
// invocation that finds it incomplete throws before any handler runs, which is what stops the first message that needs
// a missing variable from failing mid-handler.
export const validateFunctionsEnvironment = (): void => {
  if (isValidated) return;
  validateEnvironmentVariables(functionsEnvironmentVariablesSchema, process.env);
  isValidated = true;
};
