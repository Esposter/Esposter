import type { FunctionsEnvironmentVariables } from "#src/models/environment/FunctionsEnvironmentVariables";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends FunctionsEnvironmentVariables {}
  }
}

export {};
