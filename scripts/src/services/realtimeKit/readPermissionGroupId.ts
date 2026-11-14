import type { CloudflareCredentials } from "#src/models/realtimeKit/CloudflareCredentials";

import { REALTIMEKIT_TOKEN_PERMISSION_GROUP_NAME } from "#src/services/realtimeKit/constants";
import { requestCloudflare } from "#src/services/realtimeKit/requestCloudflare";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// The id of the permission group the provisioned token is granted. Read before anything is written, so a name the
// Account does not carry stops the run before an app or a preset exists
export const readPermissionGroupId = async (credentials: CloudflareCredentials): Promise<string> => {
  const { result } = await requestCloudflare(credentials, {
    method: "GET",
    path: `/tokens/permission_groups?name=${encodeURIComponent(REALTIMEKIT_TOKEN_PERMISSION_GROUP_NAME)}`,
    schema: z.object({ result: z.array(z.object({ id: z.string(), name: z.string() })) }),
  });
  const group = result.find(({ name }) => name === REALTIMEKIT_TOKEN_PERMISSION_GROUP_NAME);
  if (!group)
    throw new InvalidOperationError(
      Operation.Read,
      REALTIMEKIT_TOKEN_PERMISSION_GROUP_NAME,
      "is not a permission group of this account",
    );
  return group.id;
};
