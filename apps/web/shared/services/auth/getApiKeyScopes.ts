import type { McpScope } from "@esposter/db-schema";

import { apiKeyPermissionsSchema } from "@esposter/db-schema";

// The scopes a key holds, read from the permissions better-auth hands back. Deny by default: a key with no
// Permissions, or with any it was never given by this app, holds none and so reaches no tool
export const getApiKeyScopes = (permissions: unknown): McpScope[] => {
  const result = apiKeyPermissionsSchema.safeParse(permissions);
  return result.success ? result.data.mcp : [];
};
