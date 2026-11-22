import type { z } from "zod";

// The refusals a Worker's schema makes of its secrets, each the variable's name and the zod code it failed on, never
// Its value. Only the secrets are checked: the Worker's other variables are wrangler vars the file never holds, so no
// Schema parses it whole. A secret the file lacks reads as undefined, and the model tests hold the file's names to the
// Marked keys
export const getWorkerSecretFailures = (
  schema: z.ZodObject<Record<string, z.ZodType>>,
  secrets: Record<string, string>,
): string[] =>
  Object.entries(schema.shape)
    .filter(([, field]) => field.meta()?.secret === true)
    .flatMap(([name, field]) => {
      const { error, success } = field.safeParse(secrets[name]);
      return success ? [] : error.issues.map(({ code }) => `${name}: ${code}`);
    });
