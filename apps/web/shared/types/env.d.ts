import type { WebEnvironmentVariables } from "#shared/models/environment/WebEnvironmentVariables";

declare global {
  namespace NodeJS {
    interface ProcessEnv extends WebEnvironmentVariables {}
  }
}

export {};
