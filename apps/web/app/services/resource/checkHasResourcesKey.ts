import { getApiKeyScopes } from "#shared/services/auth/getApiKeyScopes";
import { McpScope } from "@esposter/db-schema";

// Whether any of the person's keys holds the Resources scope, which the session's key needs for Ask Claude to edit
export const checkHasResourcesKey = (apiKeys: { permissions: unknown }[]) =>
  apiKeys.some(({ permissions }) => getApiKeyScopes(permissions).includes(McpScope.Resources));
