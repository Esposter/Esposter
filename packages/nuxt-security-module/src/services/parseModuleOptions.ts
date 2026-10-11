import type { ModuleOptions } from "#src/models/ModuleOptions";

import { moduleOptionsSchema } from "#src/schemas/moduleOptionsSchema";
import { formatZodIssues } from "#src/services/formatZodIssues";

// An option that breaks its schema stops the build, naming each path and the rule it broke
export const parseModuleOptions = (options: unknown): ModuleOptions => {
  const result = moduleOptionsSchema.safeParse(options);
  if (!result.success) throw new TypeError(`nuxt-security-module: ${formatZodIssues(result.error.issues)}`);

  return result.data;
};
