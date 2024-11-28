import { JSONClasses } from "#shared/services/superjson/JSONClasses";
import { RegisterSuperJSON } from "#shared/services/superjson/RegisterSuperJSON";
import baseSuperJSON from "superjson";

// @TODO: Change this to use class decorators when it is supported
// https://github.com/nuxt/nuxt/issues/14126
for (const cls of JSONClasses.map((c) => c.cls)) RegisterSuperJSON(cls);

export const SuperJSON = baseSuperJSON;
