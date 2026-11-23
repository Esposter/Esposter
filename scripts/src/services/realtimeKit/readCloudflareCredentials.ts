import type { CloudflareCredentials } from "#src/models/realtimeKit/CloudflareCredentials";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import { getEscKey } from "#src/services/realtimeKit/getEscKey";
import { readEscValue } from "#src/services/realtimeKit/readEscValue";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The environment's RealtimeKit token, the one Pulumi made and ESC holds under the key the realtime Worker reads. The
// Provisioning calls RealtimeKit with it, so a key that holds no value is refused rather than sent unauthenticated
export const readCloudflareCredentials = async (environment: CloudflareEnvironment): Promise<CloudflareCredentials> => {
  const key = getEscKey(environment, "REALTIMEKIT_API_TOKEN");
  const apiToken = await readEscValue(key);
  if (apiToken === undefined)
    throw new InvalidOperationError(Operation.Read, key, "holds no value in ESC: write the stack output to ESC first");
  return { apiToken };
};
