import { apiKeyPermissionsSchema } from "#src/models/user/ApiKeyPermissions";
import { API_KEY_NAME_MAX_LENGTH } from "#src/services/auth/constants";
import { createNameSchema } from "#src/services/shared/createNameSchema";
import { z } from "zod";

export const createApiKeyInputSchema = z.object({
  // A key reaching no tool is no key at all, so it holds one scope at least
  mcpScopes: apiKeyPermissionsSchema.shape.mcp.min(1),
  name: createNameSchema(API_KEY_NAME_MAX_LENGTH),
});
export type CreateApiKeyInput = z.infer<typeof createApiKeyInputSchema>;
