import { webEnvironmentVariablesSchema } from "#shared/models/environment/WebEnvironmentVariables";
import { validateEnvironmentVariables } from "@esposter/shared";
import { definePlugin } from "nitro";

// The first plugin by name, so a deployment missing a variable stops here with the whole list rather than at the
// First request that reads one. A prerender runs at build time, where the deployment's environment is not set
export default definePlugin(() => {
  if (import.meta.prerender) return;
  validateEnvironmentVariables(webEnvironmentVariablesSchema, process.env);
});
