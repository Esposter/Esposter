import { z } from "zod";

// Every credential the cutover reads, from the environment only. None is written to disk or logged, and a failure names
// the variable it lacks, never its value
export const cutoverEnvironmentVariablesSchema = z.object({
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  CLOUDFLARE_D1_CORE_DATABASE_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  SOURCE_AZURE_STORAGE_CONNECTION_STRING: z.string().min(1),
  SOURCE_DATABASE_URL: z.url(),
});
export type CutoverEnvironmentVariables = z.infer<typeof cutoverEnvironmentVariablesSchema>;
