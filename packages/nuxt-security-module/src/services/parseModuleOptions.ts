import type { ModuleOptions } from "#src/models/ModuleOptions";

import { moduleOptionsSchema } from "#src/schemas/moduleOptionsSchema";
import { z } from "zod";

// Every option group is a union whose first branch is its object and whose second is `false`.
// The `false` branch's complaint hides the object's, so a union is read through its first branch
const getReadableIssue = (issue: z.core.$ZodIssue): z.core.$ZodIssue => {
  const [branch] = issue.code === "invalid_union" ? issue.errors : [];
  const [firstIssue] = branch ?? [];
  return firstIssue ? getReadableIssue(firstIssue) : issue;
};

// A branch reports its path from the union it sits in, so the union's own path leads the leaf's
const formatIssue = (issue: z.core.$ZodIssue): string => {
  const readable = getReadableIssue(issue);
  const path = [...issue.path, ...(readable === issue ? [] : readable.path)];
  return `${path.join(".") || "(options)"}: ${readable.message}`;
};

// An option that breaks its schema stops the build, naming each path and the rule it broke
export const parseModuleOptions = (options: unknown): ModuleOptions => {
  const result = moduleOptionsSchema.safeParse(options);
  if (!result.success) throw new TypeError(`nuxt-security-module: ${result.error.issues.map(formatIssue).join("; ")}`);

  return result.data;
};
