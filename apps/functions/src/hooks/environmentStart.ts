import { functionsEnvironmentVariablesSchema } from "#src/models/environment/FunctionsEnvironmentVariables";
import { app } from "@azure/functions";
import { validateEnvironmentVariables } from "@esposter/shared";

// Rejects on purpose, unlike the drain hook beside it: an app whose environment is incomplete must not register its
// Functions, because the first event to need a missing variable would fail mid-handler instead of at the start
app.hook.appStart(() => {
  validateEnvironmentVariables(functionsEnvironmentVariablesSchema, process.env);
});

export default {};
