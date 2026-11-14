import type { CloudflareCredentials } from "#src/models/realtimeKit/CloudflareCredentials";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

const cloudflareCredentialsSchema = z.object({ CLOUDFLARE_API_TOKEN: z.string().min(1) });

// Read from the environment only. The error names the variables that are missing, never a value
export const readCloudflareCredentials = (): CloudflareCredentials => {
  const result = cloudflareCredentialsSchema.safeParse(process.env);
  if (!result.success)
    throw new InvalidOperationError(
      Operation.Read,
      "environment",
      `these variables are missing: ${result.error.issues.map(({ path }) => path.join(".")).join(", ")}`,
    );
  return { apiToken: result.data.CLOUDFLARE_API_TOKEN };
};
