import type { McpScope } from "#shared/models/auth/McpScope";

import { McpScopes, mcpScopeSchema } from "#shared/models/auth/McpScope";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A key's permissions as better-auth stores them, a record of resource to actions. The plugin sets them only from the
// Server, so the scopes a key holds are the ones its owner ticked and nothing a client sent
export interface ApiKeyPermissions {
  mcp: McpScope[];
}

export const apiKeyPermissionsSchema = z.object({
  mcp: createUniqueArraySchema(mcpScopeSchema).max(McpScopes.length),
}) satisfies z.ZodType<ApiKeyPermissions>;
